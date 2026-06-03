"use client";

import { ExternalLink, FileText } from "lucide-react";
import { Loader2 } from "lucide-react";
import type {
  AdminApplicantDetailsResponse,
  AdminEducationRecord,
  AdminApplicantStatus,
  AdminFamilyDetails,
} from "@/lib/api";
import { getAssetUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

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

function formatCurrency(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Not provided";
  return `MWK ${value}`;
}

function formatPercent(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Not provided";
  return `${value}%`;
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

function EducationList({
  title,
  records,
}: {
  title: string;
  records: AdminEducationRecord[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</p>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {records.length} {records.length === 1 ? "record" : "records"}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
          No records submitted for this level.
        </div>
      ) : (
        records.map((record) => (
          <div key={record.id} className="border border-slate-200 bg-slate-50/60 p-4">
            <DetailGrid
              fields={[
                { label: "School Name", value: formatValue(record.schoolName) },
                { label: "Tuition Fees", value: formatCurrency(record.tuitionFees) },
                { label: "Year Completed", value: formatValue(record.yearCompleted) },
                { label: "Who Paid Fees", value: formatValue(record.whoPaidFees) },
                { label: "Verified", value: record.isVerified ? "Yes" : "No" },
              ]}
            />
          </div>
        ))
      )}
    </div>
  );
}

function FamilyDetailsSection({ family }: { family: AdminFamilyDetails }) {
  const status = family.parentalStatus;

  const sharedFields = [
    { label: "Parental Status", value: formatValue(family.parentalStatus) },
    { label: "Number of Siblings", value: formatValue(family.numberOfSiblings) },
    { label: "Number Still in School", value: formatValue(family.numberStillInSchool) },
    { label: "Siblings in Primary", value: formatValue(family.siblingsInPrimary) },
    { label: "Siblings in Secondary", value: formatValue(family.siblingsInSecondary) },
    { label: "Siblings in Tertiary", value: formatValue(family.siblingsInTertiary) },
  ];

  const conditionalFields =
    status === "both"
      ? [
          { label: "Father First Name", value: formatValue(family.fatherFirstName) },
          { label: "Father Surname", value: formatValue(family.fatherSurname) },
          { label: "Father National ID", value: formatValue(family.fatherNationalId) },
          { label: "Father Phone", value: formatValue(family.fatherPhone) },
          { label: "Father Profession", value: formatValue(family.fatherProfession) },
          { label: "Father Monthly Income", value: formatValue(family.fatherMonthlyIncome) },
          { label: "Father T/A", value: formatValue(family.fatherTa) },
          { label: "Father Residential Address", value: formatValue(family.fatherResidentialAddress) },
          { label: "Father Postal Address", value: formatValue(family.fatherPostalAddress) },
          { label: "Mother First Name", value: formatValue(family.motherFirstName) },
          { label: "Mother Surname", value: formatValue(family.motherSurname) },
          { label: "Mother National ID", value: formatValue(family.motherNationalId) },
          { label: "Mother Phone", value: formatValue(family.motherPhone) },
          { label: "Mother Profession", value: formatValue(family.motherProfession) },
          { label: "Mother Monthly Income", value: formatValue(family.motherMonthlyIncome) },
          { label: "Mother T/A", value: formatValue(family.motherTa) },
          { label: "Mother Residential Address", value: formatValue(family.motherResidentialAddress) },
          { label: "Mother Postal Address", value: formatValue(family.motherPostalAddress) },
        ]
      : status === "one"
        ? [
            { label: "Parent First Name", value: formatValue(family.parentFirstName) },
            { label: "Parent Surname", value: formatValue(family.parentSurname) },
            { label: "Parent National ID", value: formatValue(family.parentNationalId) },
            { label: "Parent Phone", value: formatValue(family.parentPhone) },
            { label: "Parent Monthly Income", value: formatValue(family.parentMonthlyIncome) },
            { label: "Relationship to Student", value: formatValue(family.studentRelationship) },
            { label: "Parent T/A", value: formatValue(family.parentTa) },
            { label: "Parent Residential Address", value: formatValue(family.parentResidentialAddress) },
            { label: "Parent Postal Address", value: formatValue(family.parentPostalAddress) },
            { label: "Deceased Parent ID", value: formatValue(family.deceasedParentId) },
          ]
        : status === "none"
          ? [
              { label: "Guardian First Name", value: formatValue(family.guardianFirstName) },
              { label: "Guardian Last Name", value: formatValue(family.guardianLastName) },
              { label: "Guardian National ID", value: formatValue(family.guardianNationalId) },
              { label: "Guardian Phone", value: formatValue(family.guardianPhone) },
              { label: "Guardian Monthly Income", value: formatValue(family.guardianMonthlyIncome) },
              { label: "Relationship to Guardian", value: formatValue(family.relationshipToGuardian) },
              { label: "Guardian T/A", value: formatValue(family.guardianTa) },
              { label: "Guardian Residential Address", value: formatValue(family.guardianResidentialAddress) },
              { label: "Guardian Postal Address", value: formatValue(family.guardianPostalAddress) },
              { label: "Deceased Father ID", value: formatValue(family.deceasedFatherId) },
              { label: "Deceased Mother ID", value: formatValue(family.deceasedMotherId) },
            ]
          : [];

  return <DetailGrid fields={[...sharedFields, ...conditionalFields]} />;
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
  const family = details?.application.familyDetails;
  const education = details?.application.education;

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

          <SectionCard title="Scoring">
            <DetailGrid
              fields={[
                { label: "Need Index Score", value: formatValue(details.applicant.score) },
                { label: "Rank", value: formatValue(details.applicant.rank) },
                { label: "Overall Percentage", value: formatPercent(details.applicant.overallPercentage) },
                { label: "System Flagged", value: details.applicant.scoreFlagged ? "Yes" : "No" },
              ]}
            />
            {details.applicant.scoreFlagReason && (
              <div className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">System flag</p>
                <p className="text-xs font-normal text-amber-800 leading-relaxed">
                  {details.applicant.scoreFlagReason}
                </p>
              </div>
            )}
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

          {family && (
            <SectionCard title="Family Details">
              <FamilyDetailsSection family={family} />
            </SectionCard>
          )}

          {/* Consent Form Viewer */}
          <SectionCard title="Consent Form">
            {family?.consentFormUrl ? (
              <div className="space-y-3">
                <p className="text-xs font-normal text-slate-500">
                  The applicant has uploaded a consent form. Review it before making a decision.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={getAssetUrl(family.consentFormUrl) ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-2 border border-brand-blue bg-white px-4 py-2.5",
                      "text-xs font-medium text-brand-blue transition-colors",
                      "hover:bg-brand-blue hover:text-white",
                    )}
                  >
                    <FileText size={14} />
                    Open Consent Form
                    <ExternalLink size={12} />
                  </a>
                </div>
                {/* Inline PDF preview if it's a PDF URL */}
                {family.consentFormUrl.toLowerCase().endsWith(".pdf") && (
                  <div className="border border-slate-200 overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 flex items-center gap-2">
                      <FileText size={13} className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">Consent Form Preview</span>
                    </div>
                    <iframe
                      src={`${getAssetUrl(family.consentFormUrl)}#toolbar=0&navpanes=0`}
                      className="w-full h-[480px]"
                      title="Consent Form"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
                <FileText size={16} className="text-slate-300 shrink-0" />
                <p className="text-sm font-normal text-slate-400">No consent form uploaded.</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Payment Details">
            <DetailGrid
              fields={[
                { label: "Payment Method", value: formatValue(personal?.paymentMethod) },
                { label: "Payment Phone Number", value: formatValue(personal?.paymentPhoneNumber) },
                { label: "Bank Name", value: formatValue(personal?.bankName) },
                { label: "Bank Account Number", value: formatValue(personal?.bankAccount) },
                { label: "Account Name", value: formatValue(personal?.accountName) },
              ]}
            />
          </SectionCard>

          <SectionCard title="Education History">
            <div className="space-y-6">
              <EducationList title="Primary" records={education?.primary ?? []} />
              <EducationList title="Secondary" records={education?.secondary ?? []} />
              <EducationList title="Tertiary" records={education?.tertiary ?? []} />
            </div>
          </SectionCard>
          {children}
        </>
      ) : (
        <div className="px-5 py-4 text-sm text-slate-500">No applicant details available for {selectedApplicantId}.</div>
      )}
    </div>
  );
}
