"use client";

import { Loader2 } from "lucide-react";
import type {
  AdminApplicantDetailsResponse,
  AdminApplicantStatus,
  AdminFamilyDetails,
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
  const academics = details?.application.academicDetails;
  const family = details?.application.familyDetails;

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

          {family && (
            <SectionCard title="Family Details">
              <FamilyDetailsSection family={family} />
            </SectionCard>
          )}

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
