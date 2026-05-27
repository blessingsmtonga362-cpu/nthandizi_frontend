"use client";

import ApplicantStatusPage from "@/components/admin/applicant-status-page";
import { getApprovedAdminApplicants } from "@/lib/api";

export default function ApprovedApplicantsPage() {
  return (
    <ApplicantStatusPage
      title="Approved Applicants"
      description="Review all applicants who have already been approved by admin reviewers."
      emptyMessage="No approved applicants yet."
      loadApplicants={getApprovedAdminApplicants}
    />
  );
}
