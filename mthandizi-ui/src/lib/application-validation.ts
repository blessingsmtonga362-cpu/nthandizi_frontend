import type { ApplicationData, EducationLevel } from "@/lib/store/use-application-store";
import { isValidMalawiPhone } from "@/lib/phone";

export type FieldErrors = Record<string, string>;

const REQUIRED_MESSAGE = "This field is required.";
const PHONE_MESSAGE = "Enter a valid Malawi number (e.g. +265991234567).";
const DOB_MESSAGE = "Use a correct birth date. Applicants must be at least 12 years old.";
const NATIONAL_ID_MESSAGE = "Enter exactly 8 uppercase letters or numbers.";

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

function addRequired(errors: FieldErrors, key: string, value: string | null | undefined) {
  if (isBlank(value)) errors[key] = REQUIRED_MESSAGE;
}

function addPhone(errors: FieldErrors, key: string, value: string | null | undefined) {
  if (isBlank(value)) {
    errors[key] = REQUIRED_MESSAGE;
    return;
  }

  if (!isValidMalawiPhone(value ?? "")) errors[key] = PHONE_MESSAGE;
}

export function toNationalIdValue(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
}

export function isValidNationalId(value: string): boolean {
  return /^[A-Z0-9]{8}$/.test(value);
}

function addNationalId(errors: FieldErrors, key: string, value: string | null | undefined) {
  if (isBlank(value)) {
    errors[key] = REQUIRED_MESSAGE;
    return;
  }

  if (!isValidNationalId(value ?? "")) errors[key] = NATIONAL_ID_MESSAGE;
}

function getMinimumBirthDate(today = new Date()): Date {
  return new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
}

export function isValidBirthDate(value: string, today = new Date()): boolean {
  if (isBlank(value)) return false;

  const birthDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return false;

  return birthDate <= getMinimumBirthDate(today);
}

function addBirthDate(errors: FieldErrors, key: string, value: string) {
  if (isBlank(value)) {
    errors[key] = REQUIRED_MESSAGE;
    return;
  }

  if (!isValidBirthDate(value)) errors[key] = DOB_MESSAGE;
}

function hasAnyEducationValue(level: EducationLevel): boolean {
  return !!(
    level.schoolName.trim() ||
    level.tuitionFee.trim() ||
    level.yearCompleted.trim() ||
    level.whoPaidFees.trim()
  );
}

function addEducationErrors(
  errors: FieldErrors,
  prefix: string,
  level: EducationLevel,
  required: boolean
) {
  if (!required && !hasAnyEducationValue(level)) return;

  addRequired(errors, `${prefix}.schoolName`, level.schoolName);
  addRequired(errors, `${prefix}.tuitionFee`, level.tuitionFee);
  addRequired(errors, `${prefix}.yearCompleted`, level.yearCompleted);
  addRequired(errors, `${prefix}.whoPaidFees`, level.whoPaidFees);
}

export function validateStep1(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};
  const { personal, payment } = data;

  addRequired(errors, "personal.firstName", personal.firstName);
  addRequired(errors, "personal.surname", personal.surname);
  addPhone(errors, "personal.phoneNumber", personal.phoneNumber);
  addNationalId(errors, "personal.nationalId", personal.nationalId);
  addRequired(errors, "personal.homeDistrict", personal.homeDistrict);
  addRequired(errors, "personal.ta", personal.ta);
  addRequired(errors, "personal.physicalAddress", personal.physicalAddress);
  addBirthDate(errors, "personal.dateOfBirth", personal.dateOfBirth);
  addRequired(errors, "personal.registrationNumber", personal.registrationNumber);
  addRequired(errors, "personal.maritalStatus", personal.maritalStatus);
  addRequired(errors, "personal.gender", personal.gender);
  addRequired(errors, "payment.paymentMethod", payment.paymentMethod);

  if (payment.paymentMethod === "airtel" || payment.paymentMethod === "tnm") {
    addPhone(errors, "payment.phoneNumber", payment.phoneNumber);
    addRequired(errors, "payment.accountName", payment.accountName);
  }

  if (payment.paymentMethod === "national" || payment.paymentMethod === "standard") {
    addRequired(errors, "payment.accountNumber", payment.accountNumber);
    addRequired(errors, "payment.accountName", payment.accountName);
  }

  return errors;
}

export function validateStep2(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};
  const { family } = data;

  addRequired(errors, "family.parentalStatus", family.parentalStatus);

  if (family.parentalStatus === "both") {
    addRequired(errors, "family.fatherFirstName", family.fatherFirstName);
    addRequired(errors, "family.fatherSurname", family.fatherSurname);
    addNationalId(errors, "family.fatherNationalId", family.fatherNationalId);
    addPhone(errors, "family.fatherPhone", family.fatherPhone);
    addRequired(errors, "family.fatherProfession", family.fatherProfession);
    addRequired(errors, "family.fatherMonthlyIncome", family.fatherMonthlyIncome);
    addRequired(errors, "family.fatherTa", family.fatherTa);
    addRequired(errors, "family.fatherResidentialAddress", family.fatherResidentialAddress);
    addRequired(errors, "family.fatherPostalAddress", family.fatherPostalAddress);
    addRequired(errors, "family.motherFirstName", family.motherFirstName);
    addRequired(errors, "family.motherSurname", family.motherSurname);
    addNationalId(errors, "family.motherNationalId", family.motherNationalId);
    addPhone(errors, "family.motherPhone", family.motherPhone);
    addRequired(errors, "family.motherProfession", family.motherProfession);
    addRequired(errors, "family.motherMonthlyIncome", family.motherMonthlyIncome);
    addRequired(errors, "family.motherTa", family.motherTa);
    addRequired(errors, "family.motherResidentialAddress", family.motherResidentialAddress);
    addRequired(errors, "family.motherPostalAddress", family.motherPostalAddress);
  }

  if (family.parentalStatus === "one") {
    addRequired(errors, "family.parentFirstName", family.parentFirstName);
    addRequired(errors, "family.parentSurname", family.parentSurname);
    addNationalId(errors, "family.parentNationalId", family.parentNationalId);
    addPhone(errors, "family.parentPhone", family.parentPhone);
    addRequired(errors, "family.parentMonthlyIncome", family.parentMonthlyIncome);
    addRequired(errors, "family.studentRelationship", family.studentRelationship);
    addRequired(errors, "family.parentTa", family.parentTa);
    addRequired(errors, "family.parentResidentialAddress", family.parentResidentialAddress);
    addRequired(errors, "family.parentPostalAddress", family.parentPostalAddress);
    addNationalId(errors, "family.deceasedParentId", family.deceasedParentId);
  }

  if (family.parentalStatus === "none") {
    addRequired(errors, "family.guardianFirstName", family.guardianFirstName);
    addRequired(errors, "family.guardianSurname", family.guardianSurname);
    addNationalId(errors, "family.guardianNationalId", family.guardianNationalId);
    addPhone(errors, "family.guardianPhone", family.guardianPhone);
    addRequired(errors, "family.guardianMonthlyIncome", family.guardianMonthlyIncome);
    addRequired(errors, "family.relationshipToGuardian", family.relationshipToGuardian);
    addRequired(errors, "family.guardianTa", family.guardianTa);
    addRequired(errors, "family.guardianResidentialAddress", family.guardianResidentialAddress);
    addRequired(errors, "family.guardianPostalAddress", family.guardianPostalAddress);
    addNationalId(errors, "family.deceasedFatherId", family.deceasedFatherId);
    addNationalId(errors, "family.deceasedMotherId", family.deceasedMotherId);
  }

  addRequired(errors, "family.numberOfSiblings", family.numberOfSiblings);
  if (family.numberOfSiblings && Number(family.numberOfSiblings) > 0) {
    addRequired(errors, "family.numberStillInSchool", family.numberStillInSchool);
  }

  if (!family.guarantorConsentFile) {
    errors["family.guarantorConsentFile"] = REQUIRED_MESSAGE;
  }

  return errors;
}

export function validateStep3(data: ApplicationData): FieldErrors {
  const errors: FieldErrors = {};

  addEducationErrors(errors, "education.primary", data.education.primary, true);
  addEducationErrors(errors, "education.secondary", data.education.secondary, true);
  addEducationErrors(errors, "education.tertiary", data.education.tertiary, false);

  return errors;
}

export function validateStep4(data: ApplicationData): FieldErrors {
  return data.declarationAccepted ? {} : { declarationAccepted: REQUIRED_MESSAGE };
}

export function validateApplication(data: ApplicationData): {
  errors: FieldErrors;
  firstInvalidStep: number | null;
} {
  const stepErrors = [
    validateStep1(data),
    validateStep2(data),
    validateStep3(data),
    validateStep4(data),
  ];
  const firstInvalidStep = stepErrors.findIndex((errors) => Object.keys(errors).length > 0);

  return {
    errors: Object.assign({}, ...stepErrors),
    firstInvalidStep: firstInvalidStep === -1 ? null : firstInvalidStep + 1,
  };
}

export function getDateInputMaxForAge(minimumAge: number, today = new Date()): string {
  const date = new Date(today.getFullYear() - minimumAge, today.getMonth(), today.getDate());
  return date.toISOString().slice(0, 10);
}
