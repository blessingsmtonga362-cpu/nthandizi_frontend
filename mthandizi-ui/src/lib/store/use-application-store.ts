import { create } from 'zustand';

export interface PersonalData {
  firstName: string;
  surname: string;
  phoneNumber: string;
  nationalId: string;
  homeDistrict: string;
  physicalAddress: string;
  dateOfBirth: string;
  maritalStatus: string;
  disability: string;
  ta: string;
  registrationNumber: string;
  gender: string;
  studentIdFile: File | null;
  nationalIdFile: File | null;
}

export interface FamilyData {
  // Parental status selector
  parentalStatus: string; // "both" | "one" | "none"

  // Both parents alive — father
  fatherFirstName: string;
  fatherSurname: string;
  fatherNationalId: string;
  fatherPhone: string;
  fatherProfession: string;
  fatherMonthlyIncome: string;
  fatherTa: string;
  fatherResidentialAddress: string;
  fatherPostalAddress: string;

  // Both parents alive — mother
  motherFirstName: string;
  motherSurname: string;
  motherNationalId: string;
  motherPhone: string;
  motherProfession: string;
  motherMonthlyIncome: string;
  motherTa: string;
  motherResidentialAddress: string;
  motherPostalAddress: string;

  // One parent alive
  parentFirstName: string;
  parentSurname: string;
  parentNationalId: string;
  parentPhone: string;
  parentMonthlyIncome: string;
  studentRelationship: string;
  parentTa: string;
  parentResidentialAddress: string;
  parentPostalAddress: string;
  deceasedParentId: string;

  // Guardian / next of kin (none alive)
  guardianFirstName: string;
  guardianSurname: string;
  guardianNationalId: string;
  guardianPhone: string;
  guardianMonthlyIncome: string;
  relationshipToGuardian: string;
  guardianTa: string;
  guardianResidentialAddress: string;
  guardianPostalAddress: string;
  deceasedFatherId: string;
  deceasedMotherId: string;

  numberOfSiblings: string;
  numberStillInSchool: string;
  siblingsInPrimary: string;
  siblingsInSecondary: string;
  siblingsInTertiary: string;

  // Documents
  guarantorConsentFile: File | null;

  // Legacy fields kept for review step compatibility
  guardianProfession: string;
  guardianDob: string;
  guardianEmail: string;
  guardianEducationLevel: string;
  deathCertificateFile: File | null;
  guarantorNationalIdFile: File | null;
}

export interface EducationLevel {
  schoolName: string;
  tuitionFee: string;
  yearCompleted: string;
  whoPaidFees: string;
}

export interface EducationData {
  primary: EducationLevel;
  secondary: EducationLevel;
  tertiary: EducationLevel;
}

export interface AcademicsData {
  programOfStudy: string;
  department: string;
  yearOfStudy: string;
  transcriptFile: File | null;
}

export interface PaymentData {
  paymentMethod: string;
  phoneNumber: string;
  accountName: string;
  accountNumber: string;
}

export interface ApplicationData {
  personal: PersonalData;
  family: FamilyData;
  education: EducationData;
  academics: AcademicsData;
  payment: PaymentData;
  currentStep: number;
  lastSaved: Date | null;
  reviewVisited: boolean;
  declarationAccepted: boolean;
}

interface ApplicationStore {
  data: ApplicationData;
  updatePersonal: (d: Partial<PersonalData>) => void;
  updateFamily: (d: Partial<FamilyData>) => void;
  updateEducation: (level: keyof EducationData, d: Partial<EducationLevel>) => void;
  updateAcademics: (d: Partial<AcademicsData>) => void;
  updatePayment: (d: Partial<PaymentData>) => void;
  setStep: (step: number) => void;
  setReviewVisited: (visited?: boolean) => void;
  setDeclarationAccepted: (accepted: boolean) => void;
  reset: () => void;
}

const emptyEducationLevel: EducationLevel = {
  schoolName: '', tuitionFee: '', yearCompleted: '', whoPaidFees: '',
};

const initialData: ApplicationData = {
  personal: {
    firstName: '', surname: '', phoneNumber: '', nationalId: '',
    homeDistrict: '', physicalAddress: '', dateOfBirth: '', maritalStatus: '',
    disability: 'None', ta: '', registrationNumber: '', gender: '',
    studentIdFile: null, nationalIdFile: null,
  },
  family: {
    parentalStatus: '',
    fatherFirstName: '', fatherSurname: '', fatherNationalId: '', fatherPhone: '',
    fatherProfession: '', fatherMonthlyIncome: '', fatherTa: '', fatherResidentialAddress: '', fatherPostalAddress: '',
    motherFirstName: '', motherSurname: '', motherNationalId: '', motherPhone: '',
    motherProfession: '', motherMonthlyIncome: '', motherTa: '', motherResidentialAddress: '', motherPostalAddress: '',
    parentFirstName: '', parentSurname: '', parentNationalId: '', parentPhone: '',
    parentMonthlyIncome: '', studentRelationship: '', parentTa: '', parentResidentialAddress: '', parentPostalAddress: '',
    deceasedParentId: '',
    guardianFirstName: '', guardianSurname: '', guardianNationalId: '', guardianPhone: '',
    guardianMonthlyIncome: '', relationshipToGuardian: '', guardianTa: '', guardianResidentialAddress: '', guardianPostalAddress: '',
    deceasedFatherId: '', deceasedMotherId: '',
    numberOfSiblings: '', numberStillInSchool: '', siblingsInPrimary: '', siblingsInSecondary: '', siblingsInTertiary: '',
    guarantorConsentFile: null,
    guardianProfession: '', guardianDob: '', guardianEmail: '', guardianEducationLevel: '',
    deathCertificateFile: null, guarantorNationalIdFile: null,
  },
  education: {
    primary: { ...emptyEducationLevel },
    secondary: { ...emptyEducationLevel },
    tertiary: { ...emptyEducationLevel },
  },
  academics: {
    programOfStudy: '', department: '', yearOfStudy: '', transcriptFile: null,
  },
  payment: {
    paymentMethod: '', phoneNumber: '', accountName: '', accountNumber: '',
  },
  currentStep: 1,
  lastSaved: null,
  reviewVisited: false,
  declarationAccepted: false,
};

export const useApplicationStore = create<ApplicationStore>((set) => ({
  data: initialData,
  updatePersonal: (d) => set((s) => ({
    data: { ...s.data, personal: { ...s.data.personal, ...d }, lastSaved: new Date() }
  })),
  updateFamily: (d) => set((s) => ({
    data: { ...s.data, family: { ...s.data.family, ...d }, lastSaved: new Date() }
  })),
  updateEducation: (level, d) => set((s) => ({
    data: {
      ...s.data,
      education: {
        ...s.data.education,
        [level]: { ...s.data.education[level], ...d },
      },
      lastSaved: new Date(),
    }
  })),
  updateAcademics: (d) => set((s) => ({
    data: { ...s.data, academics: { ...s.data.academics, ...d }, lastSaved: new Date() }
  })),
  updatePayment: (d) => set((s) => ({
    data: { ...s.data, payment: { ...s.data.payment, ...d }, lastSaved: new Date() }
  })),
  setStep: (step) =>
    set((s) => ({
      data: {
        ...s.data,
        currentStep: step,
        reviewVisited: s.data.reviewVisited || step >= 4,
      },
    })),
  setReviewVisited: (visited = true) =>
    set((s) => ({
      data: { ...s.data, reviewVisited: visited, lastSaved: new Date() },
    })),
  setDeclarationAccepted: (accepted) =>
    set((s) => ({
      data: {
        ...s.data,
        declarationAccepted: accepted,
        reviewVisited: true,
        lastSaved: new Date(),
      },
    })),
  reset: () => set({ data: initialData }),
}));
