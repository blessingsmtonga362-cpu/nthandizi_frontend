import { useEffect } from 'react';
import { openDB } from 'idb';
import { useApplicationStore } from '@/lib/store/use-application-store';
import { getStoredUser } from '@/lib/api';

const DB_NAME = 'unima_support_db';
const STORE_NAME = 'application_draft';

// ─── STORAGE STRATEGY ────────────────────────────────────────────────────────
//
// This hook manages LOCAL-ONLY offline persistence using IndexedDB (browser storage).
// It is intentionally decoupled from the backend.
//
// • The "Continue" button NEVER sends data to the server — it only advances the step.
// • Data is saved to IndexedDB locally so the student can close the browser and
//   resume later without losing their progress.
// • The ONLY time data is sent to the backend database is when the student clicks
//   "Submit Profile" on the final step, which calls submitApplication() in api.ts.
//
// ─────────────────────────────────────────────────────────────────────────────

function getDraftKey(): string {
  const user = getStoredUser();
  return user?.id ? `draft_${user.id}` : 'draft_anonymous';
}

export function useOfflinePersistence() {
  const { data, updatePersonal, updateFamily, updateEducation, updateAcademics, updatePayment } = useApplicationStore();

  // ── On mount: restore any previously saved local draft into memory ──────────
  useEffect(() => {
    const initDB = async () => {
      try {
        const draftKey = getDraftKey();
        const db = await openDB(DB_NAME, 2, {
          upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME);
            }
          },
        });
        const saved = await db.get(STORE_NAME, draftKey);
        if (saved) {
          if (saved.personal) updatePersonal(saved.personal);
          if (saved.family) updateFamily(saved.family);
          if (saved.education) {
            updateEducation('primary', saved.education.primary);
            updateEducation('secondary', saved.education.secondary);
            updateEducation('tertiary', saved.education.tertiary);
          }
          if (saved.academics) updateAcademics(saved.academics);
          if (saved.payment) updatePayment(saved.payment);
          if (saved.reviewVisited) {
            useApplicationStore.getState().setReviewVisited(true);
          }
          if (saved.declarationAccepted) {
            useApplicationStore.getState().setDeclarationAccepted(true);
          }
          if (saved.currentStep) {
            useApplicationStore.getState().setStep(saved.currentStep);
          }
        }
      } catch {
        // IndexedDB unavailable (private browsing, storage quota, etc.) — silently skip
      }
    };
    initDB().catch(() => { /* IndexedDB unavailable — silently skip */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── On every form change: persist draft to LOCAL IndexedDB only ─────────────
  // NOTE: This writes to the browser's IndexedDB — NOT to the backend server.
  //       No API call is made here. The backend only receives data on final Submit.
  useEffect(() => {
    const syncLocalDraft = async () => {
      try {
        const draftKey = getDraftKey();
        const db = await openDB(DB_NAME, 2);
        // Strip File objects — they cannot be serialised into IndexedDB
        const serializable = {
          personal: { ...data.personal, studentIdFile: null, nationalIdFile: null },
          family: { ...data.family, deathCertificateFile: null, guarantorNationalIdFile: null, guarantorConsentFile: null },
          education: data.education,
          academics: { ...data.academics, transcriptFile: null },
          payment: data.payment,
          currentStep: data.currentStep,
          reviewVisited: data.reviewVisited,
          declarationAccepted: data.declarationAccepted,
        };
        // Writes to IndexedDB (local browser storage) — no network request
        await db.put(STORE_NAME, serializable, draftKey);
      } catch {
        // Sync failure is non-fatal — draft is still in memory
      }
    };
    if (data.lastSaved) syncLocalDraft().catch(() => { /* Sync failure is non-fatal */ });
  }, [data]);
}

// Called after a successful Submit to wipe the local draft from IndexedDB.
// The data has been sent to the backend — the local copy is no longer needed.
export async function clearOfflinePersistence(): Promise<void> {
  try {
    const draftKey = getDraftKey();
    const db = await openDB(DB_NAME, 2);
    await db.delete(STORE_NAME, draftKey);
  } catch {
    // Nothing to clear or IndexedDB unavailable
  }
}
