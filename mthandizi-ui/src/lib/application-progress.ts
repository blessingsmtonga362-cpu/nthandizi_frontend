import type { ApplicationData, EducationLevel, FamilyData, PersonalData, PaymentData } from "@/lib/store/use-application-store";

export type SectionState = "empty" | "partial" | "complete";

export type ApplicationProgress = {
  percent: number;
  filledCount: number;
  totalCount: number;
  completedSteps: number;
  totalSteps: number;
  hasAnyInput: boolean;
  sections: {
    personal: SectionState;
    family: SectionState;
    education: SectionState;
    review: SectionState;
  };
};

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (value instanceof File) return true;
  return false;
}

function countFields(values: unknown[]): { filled: number; total: number } {
  const total = values.length;
  const filled = values.filter(isFilled).length;
  return { filled, total };
}

function sectionState(filled: number, total: number): SectionState {
  if (total === 0 || filled === 0) return "empty";
  if (filled >= total) return "complete";
  return "partial";
}

function getPersonalFields(personal: PersonalData, payment: PaymentData): unknown[] {
  const base = [
    personal.firstName,
    personal.surname,
    personal.phoneNumber,
    personal.nationalId,
    personal.homeDistrict,
    personal.physicalAddress,
    personal.dateOfBirth,
    personal.maritalStatus,
    personal.ta,
    personal.registrationNumber,
    personal.gender,
    payment.paymentMethod,
  ];

  if (!payment.paymentMethod) return base;

  const mobile = payment.paymentMethod === "airtel" || payment.paymentMethod === "tnm";
  if (mobile) {
    return [...base, payment.phoneNumber];
  }

  return [...base, payment.accountNumber, payment.accountName];
}

function getFamilyFields(family: FamilyData): unknown[] {
  const siblings = [
    family.parentalStatus,
    family.numberOfSiblings,
    family.numberStillInSchool,
    family.siblingsInPrimary,
    family.siblingsInSecondary,
    family.siblingsInTertiary,
  ];

  if (family.parentalStatus === "both") {
    return [
      ...siblings,
      family.fatherFirstName,
      family.fatherSurname,
      family.fatherNationalId,
      family.fatherPhone,
      family.fatherProfession,
      family.fatherMonthlyIncome,
      family.fatherTa,
      family.fatherResidentialAddress,
      family.fatherPostalAddress,
      family.motherFirstName,
      family.motherSurname,
      family.motherNationalId,
      family.motherPhone,
      family.motherProfession,
      family.motherMonthlyIncome,
      family.motherTa,
      family.motherResidentialAddress,
      family.motherPostalAddress,
    ];
  }

  if (family.parentalStatus === "one") {
    return [
      ...siblings,
      family.parentFirstName,
      family.parentSurname,
      family.parentNationalId,
      family.parentPhone,
      family.parentMonthlyIncome,
      family.studentRelationship,
      family.parentTa,
      family.parentResidentialAddress,
      family.parentPostalAddress,
      family.deceasedParentId,
    ];
  }

  if (family.parentalStatus === "none") {
    return [
      ...siblings,
      family.guardianFirstName,
      family.guardianSurname,
      family.guardianNationalId,
      family.guardianPhone,
      family.guardianMonthlyIncome,
      family.relationshipToGuardian,
      family.guardianTa,
      family.guardianResidentialAddress,
      family.guardianPostalAddress,
      family.deceasedFatherId,
      family.deceasedMotherId,
      family.guarantorConsentFile,
    ];
  }

  return siblings;
}

function getEducationLevelFields(level: EducationLevel): unknown[] {
  return [level.schoolName, level.tuitionFee, level.yearCompleted, level.whoPaidFees];
}

function getEducationFields(data: ApplicationData): unknown[] {
  return [
    ...getEducationLevelFields(data.education.primary),
    ...getEducationLevelFields(data.education.secondary),
    ...getEducationLevelFields(data.education.tertiary),
    data.academics.programOfStudy,
    data.academics.department,
    data.academics.yearOfStudy,
  ];
}

function getReviewFields(data: ApplicationData): unknown[] {
  const fields: unknown[] = [];
  if (data.reviewVisited) fields.push("visited");
  if (data.declarationAccepted) fields.push("declaration");
  return fields;
}

function getReviewSectionState(data: ApplicationData): SectionState {
  if (data.declarationAccepted) return "complete";
  if (data.reviewVisited || data.currentStep >= 4) return "partial";
  return "empty";
}

export function calculateApplicationProgress(data: ApplicationData): ApplicationProgress {
  const personalCount = countFields(getPersonalFields(data.personal, data.payment));
  const familyCount = countFields(getFamilyFields(data.family));
  const educationCount = countFields(getEducationFields(data));
  const reviewCount = countFields(getReviewFields(data));

  const reviewSection = getReviewSectionState(data);
  const reviewFilled =
    reviewSection === "complete" ? 2 : reviewSection === "partial" ? 1 : 0;
  const reviewTotal = 2;

  const filledCount =
    personalCount.filled + familyCount.filled + educationCount.filled + reviewFilled;
  const totalCount =
    personalCount.total + familyCount.total + educationCount.total + reviewTotal;

  const percent = totalCount === 0 ? 0 : Math.round((filledCount / totalCount) * 100);

  const sections = {
    personal: sectionState(personalCount.filled, personalCount.total),
    family: sectionState(familyCount.filled, familyCount.total),
    education: sectionState(educationCount.filled, educationCount.total),
    review: reviewSection,
  };

  const completedSteps = Object.values(sections).filter((s) => s === "complete").length;

  return {
    percent,
    filledCount,
    totalCount,
    completedSteps,
    totalSteps: 4,
    hasAnyInput: filledCount > 0,
    sections,
  };
}
