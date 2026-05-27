"use client";

import ApplicantStatusPage from "@/components/admin/applicant-status-page";
import { getFlaggedAdminApplicants } from "@/lib/api";

export default function FlaggedApplicantsPage() {
  return (
    <ApplicantStatusPage
      title="Flagged Applicants"
      description="Review all applicants who were flagged and inspect the saved reviewer comments."
      emptyMessage="No flagged applicants yet."
      loadApplicants={getFlaggedAdminApplicants}
    />
  );
}
