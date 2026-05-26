"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { openDB } from "idb";
import { calculateApplicationProgress, type ApplicationProgress } from "@/lib/application-progress";
import { useApplicationStore, type ApplicationData } from "@/lib/store/use-application-store";
import { getStoredUser } from "@/lib/api";

const DB_NAME = "unima_support_db";
const STORE_NAME = "application_draft";

function getDraftKey(): string {
  const user = getStoredUser();
  return user?.id ? `draft_${user.id}` : "draft_anonymous";
}

type DraftSnapshot = Partial<ApplicationData> & {
  personal?: ApplicationData["personal"];
  family?: ApplicationData["family"];
  education?: ApplicationData["education"];
  academics?: ApplicationData["academics"];
  payment?: ApplicationData["payment"];
  reviewVisited?: boolean;
  declarationAccepted?: boolean;
  currentStep?: number;
};

function mergeDraftIntoData(base: ApplicationData, draft: DraftSnapshot): ApplicationData {
  return {
    ...base,
    personal: draft.personal ? { ...base.personal, ...draft.personal } : base.personal,
    family: draft.family ? { ...base.family, ...draft.family } : base.family,
    education: draft.education
      ? {
          primary: { ...base.education.primary, ...draft.education.primary },
          secondary: { ...base.education.secondary, ...draft.education.secondary },
          tertiary: { ...base.education.tertiary, ...draft.education.tertiary },
        }
      : base.education,
    academics: draft.academics ? { ...base.academics, ...draft.academics } : base.academics,
    payment: draft.payment ? { ...base.payment, ...draft.payment } : base.payment,
    currentStep: draft.currentStep ?? base.currentStep,
    reviewVisited: draft.reviewVisited ?? base.reviewVisited,
    declarationAccepted: draft.declarationAccepted ?? base.declarationAccepted,
  };
}

async function loadDraftSnapshot(): Promise<DraftSnapshot | null> {
  try {
    const db = await openDB(DB_NAME, 2);
    const saved = await db.get(STORE_NAME, getDraftKey());
    return saved ?? null;
  } catch {
    return null;
  }
}

export function useApplicationProgress() {
  const data = useApplicationStore((s) => s.data);
  const [draftSnapshot, setDraftSnapshot] = useState<DraftSnapshot | null>(null);

  const refreshDraft = useCallback(async () => {
    const saved = await loadDraftSnapshot();
    setDraftSnapshot(saved);
  }, []);

  useEffect(() => {
    void refreshDraft();
  }, [refreshDraft]);

  useEffect(() => {
    const onFocus = () => void refreshDraft();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshDraft]);

  const progress: ApplicationProgress = useMemo(() => {
    const fromStore = calculateApplicationProgress(data);
    if (!draftSnapshot) return fromStore;
    if (data.lastSaved) return fromStore;

    const merged = mergeDraftIntoData(data, draftSnapshot);
    const fromDraft = calculateApplicationProgress(merged);
    return fromDraft.filledCount > fromStore.filledCount ? fromDraft : fromStore;
  }, [data, draftSnapshot]);

  return { progress, refreshDraft };
}
