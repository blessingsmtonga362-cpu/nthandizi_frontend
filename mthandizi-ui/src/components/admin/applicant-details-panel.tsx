"use client";

import { Loader2 } from "lucide-react";
import type {
  AdminApplicantDetailsResponse,
  AdminApplicantStatus,
} from "@/lib/api";

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "Not provided";
  if (typeof value === "string" && value.trim() === "") return "Not provided";
  return String(value);
}

function formatApplicantStatus(status: AdminApplicantStatus) {
  switch (status) {
    case "approved":
      return "Approved";
    case "flagged":
      return "Flagged";
    default:
      return "Pending Review";
  }
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-display font-normal text-brand-blue">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DetailGrid({ fields }: { fields: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className="space-y-1">
          <p className="text-xs font-medium text-slate-600">{field.label}</p>
          <p className="text-sm font-normal text-slate-500 break-words">{field.value}</p>
        </div>
      ))}
    </div>
  );
}

type Props = {
  selectedApplicantId: string;
  details: AdminApplicantDetailsResponse | null;
  loading: boolean;
  error: string;
  children?: React.ReactNode;
};

export function ApplicantDetailsPanel({
  selectedApplicantId,
  details,
  loading,
  error,
  children,
}: Props) {
  const personal = details?.application.personalDetails;
  const academics = details?.application.academicDetails;

  return (
    <div className="space-y-6 p-6">
      {loading ? (
        <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          Loading applicant details...
        </div>
      ) : error ? (
        <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : details ? (
        <>
          <SectionCard title="Applicant Summary">
            <DetailGrid
              fields={[
                { label: "Registration Number", value: formatValue(details.applicant.registrationNumber) },
                { label: "Email", value: formatValue(details.applicant.email) },
                { label: "Status", value: formatApplicantStatus(details.applicant.status) },
                { label: "Review Comment", value: formatValue(details.applicant.reviewComments) },
              ]}
            />
          </SectionCard>

          <SectionCard title="Personal Details">
            <DetailGrid
              fields={[
                { label: "First Name", value: formatValue(personal?.firstName) },
                { label: "Last Name", value: formatValue(personal?.lastName) },
                { label: "Phone Number", value: formatValue(personal?.phoneNumber) },
                { label: "National ID", value: formatValue(personal?.nationalIdNumber) },
                { label: "Home District", value: formatValue(personal?.homeDistrict) },
                { label: "Traditional Authority", value: formatValue(personal?.traditionalAuthority) },
                { label: "Physical Address", value: formatValue(personal?.physicalAddress) },
                { label: "Date of Birth", value: formatValue(personal?.dateOfBirth) },
              ]}
            />
          </SectionCard>

          <SectionCard title="Academic Details">
            <DetailGrid
              fields={[
                { label: "Program of Study", value: formatValue(academics?.programOfStudy) },
                { label: "Department", value: formatValue(academics?.department) },
                { label: "Year of Study", value: formatValue(academics?.yearOfStudy) },
                { label: "Transcript URL", value: formatValue(academics?.transcriptPdfUrl) },
              ]}
            />
          </SectionCard>

          {children}
        </>
      ) : (
        <div className="px-5 py-4 text-sm text-slate-500">No applicant details available for {selectedApplicantId}.</div>
      )}
    </div>
  );
}
