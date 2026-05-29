

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Token helpers

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

//  Types
export type AuthRole = "student" | "admin";
export type BackendRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  firstName?: string;
  lastName?: string;
  registrationNumber?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

function normalizeRole(role: BackendRole): AuthRole {
  return role === "admin" ? "admin" : "student";
}

export interface Notification {
  id: string | number;
  type: "success" | "info" | "urgent" | "warning";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export interface ApplicationStatus {
  status: "draft" | "submitted" | "reviewing" | "approved" | "rejected";
  completedSteps: number;
  totalSteps: number;
  lastSaved: string | null;
  submittedAt: string | null;
}

interface RawApplicationStatus {
  status?: string | null;
  completedSteps?: number;
  totalSteps?: number;
  lastSaved?: string | null;
  submittedAt?: string | null;
  applicationStatus?: string | null;
}

interface ReviewApplicationResponse {
  success: boolean;
  data: {
    personalDetails: unknown | null;
    academicDetails: unknown | null;
    familyDetails: unknown | null;
    education: {
      primary?: unknown[];
      secondary?: unknown[];
      tertiary?: unknown[];
    };
  };
  lastUpdated?: string;
}

export interface SubmitApplicationResponse {
  success: boolean;
  message: string;
  submittedAt: string;
  applicationStatus: string;
}

export async function getAcademicYearOptions(): Promise<number[]> {
  return request<number[]>("/academic-details/year-options");
}

export interface DashboardStats {
  totalApplications: number;
  approvedSupport: number;
  flaggedFiles: number;
  priorityQueue: PriorityStudent[];
}

export type AdminApplicantStatus = "pending_review" | "approved" | "flagged";

export interface PriorityStudent {
  name: string;
  id: string;
  registrationNumber?: string;
  program: string;
  score: number;
  rank: number | null;
  status: AdminApplicantStatus;
}

export interface AdminApplicantProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  status: AdminApplicantStatus;
  reviewComments: string | null;
  score?: number | null;
  rank?: number | null;
  overallPercentage?: number | null;
  scoreFlagged?: boolean | null;
  scoreFlagReason?: string | null;
}

export interface AdminApplicantListItem extends AdminApplicantProfile {
  program: string;
  department: string | null;
  yearOfStudy: number | null;
  score?: number | null;
}

export interface AdminApplicantsByStatusResponse {
  status: Extract<AdminApplicantStatus, "approved" | "flagged">;
  count: number;
  applicants: AdminApplicantListItem[];
}

export interface SponsorListItem {
  id: string;
  name: string;
  logoUrl?: string | null;
  requestedSlots: number;
  allocatedCount: number;
  status: "completed" | "partial" | "pending";
}

export interface SponsorApplicant {
  userId: string;
  rank: number;
  score: number;
  name: string;
  email: string;
  registrationNumber: string;
  program: string;
  department: string | null;
  yearOfStudy: number | null;
}

export interface SponsorDetails extends SponsorListItem {
  logoFilename?: string | null;
  applicants: SponsorApplicant[];
}

export interface AdminPersonalDetails {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  nationalIdNumber?: string;
  homeDistrict?: string;
  traditionalAuthority?: string;
  physicalAddress?: string;
  dateOfBirth?: string;
  registrationNumber?: string;
  disability?: string;
  maritalStatus?: string;
  gender?: string;
  paymentMethod?: string;
  paymentPhoneNumber?: string;
  bankName?: string;
  bankAccount?: string;
  accountName?: string;
}

export interface AdminAcademicDetails {
  programOfStudy?: string;
  department?: string;
  yearOfStudy?: number;
  transcriptPdfUrl?: string | null;
}

export interface AdminFamilyDetails {
  parentalStatus?: string;
  fatherFirstName?: string;
  fatherSurname?: string;
  fatherNationalId?: string;
  fatherPhone?: string;
  fatherProfession?: string;
  fatherMonthlyIncome?: number | string;
  fatherTa?: string;
  fatherResidentialAddress?: string;
  fatherPostalAddress?: string;
  motherFirstName?: string;
  motherSurname?: string;
  motherNationalId?: string;
  motherPhone?: string;
  motherProfession?: string;
  motherMonthlyIncome?: number | string;
  motherTa?: string;
  motherResidentialAddress?: string;
  motherPostalAddress?: string;
  parentFirstName?: string;
  parentSurname?: string;
  parentNationalId?: string;
  parentPhone?: string;
  parentMonthlyIncome?: number | string;
  studentRelationship?: string;
  parentTa?: string;
  parentResidentialAddress?: string;
  parentPostalAddress?: string;
  deceasedParentId?: string;
  guardianFirstName?: string;
  guardianLastName?: string;
  guardianNationalId?: string;
  guardianPhone?: string;
  guardianMonthlyIncome?: number | string;
  relationshipToGuardian?: string;
  guardianTa?: string;
  guardianResidentialAddress?: string;
  guardianPostalAddress?: string;
  deceasedFatherId?: string;
  deceasedMotherId?: string;
  numberOfSiblings?: number | string;
  numberStillInSchool?: number | string;
  siblingsInPrimary?: number | string;
  siblingsInSecondary?: number | string;
  siblingsInTertiary?: number | string;
  consentFormUrl?: string | null;
}

export interface AdminEducationRecord {
  id: string;
  educationLevel: string;
  schoolName: string;
  tuitionFees: number | string;
  yearCompleted: number;
  whoPaidFees: string;
  isVerified?: boolean;
}

export interface AdminVerificationLog {
  id: string;
  documentType: string;
  userInput?: string | null;
  extractedData?: string | null;
  isVerified: boolean;
  mismatches?: string | null;
  warnings?: string | null;
  createdAt: string;
}

export interface AdminApplicantDetailsResponse {
  applicant: AdminApplicantProfile;
  application: {
    personalDetails: AdminPersonalDetails | null;
    academicDetails: AdminAcademicDetails | null;
    familyDetails: AdminFamilyDetails | null;
    education: {
      primary: AdminEducationRecord[];
      secondary: AdminEducationRecord[];
      tertiary: AdminEducationRecord[];
    };
  };
  applicationMeta: {
    completionPercentage: number;
    completedSections: number;
    totalSections: number;
    missingSections: string[];
    lastUpdated: string;
  };
  verificationLogs: AdminVerificationLog[];
}

export interface ReviewAdminApplicantPayload {
  status: Extract<AdminApplicantStatus, "approved" | "flagged">;
  reviewComments?: string;
}

function normalizeApplicationStatus(status?: string | null): ApplicationStatus["status"] {
  switch (status) {
    case "submitted":
      return "submitted";
    case "reviewing":
    case "pending_review":
      return "reviewing";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      return "draft";
  }
}

function deriveStatusFromReviewApplication(data: ReviewApplicationResponse): ApplicationStatus {
  const hasPersonalDetails = !!data.data.personalDetails;
  const hasAcademicDetails = !!data.data.academicDetails;
  const hasFamilyDetails = !!data.data.familyDetails;
  const education = data.data.education ?? {};
  const educationCount =
    (education.primary?.length ?? 0) +
    (education.secondary?.length ?? 0) +
    (education.tertiary?.length ?? 0);
  const hasEducation = educationCount > 0;

  const completedSteps = [
    hasPersonalDetails,
    hasFamilyDetails,
    hasEducation,
    hasAcademicDetails,
  ].filter(Boolean).length;

  const status = completedSteps === 4 ? "reviewing" : "draft";
  const lastSaved = data.lastUpdated ?? null;

  return {
    status,
    completedSteps,
    totalSteps: 4,
    lastSaved,
    submittedAt: status === "reviewing" ? lastSaved : null,
  };
}

//  Core fetch wrapper 

const DEFAULT_REQUEST_TIMEOUT_MS = 8000;

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.message.includes("aborted"))
    ) {
      throw new Error(
        "Request timed out. Make sure the backend server is running and try again."
      );
    }
    
    if (error instanceof Error) throw error;
    throw new Error(
      typeof error === "string" && error.length > 0
        ? error
        : "Network request failed. Please check your connection."
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body?.message === "string" && body.message.trim().length > 0
        ? body.message
        : typeof body?.error === "string" && body.error.trim().length > 0
          ? body.error
          : `Request failed: ${res.status}`;
    
  

    if (res.status === 401) {
      removeToken();
      throw new Error(
        message === "Unauthorized"
          ? "Session expired or not authenticated. Please sign in again."
          : `Authentication failed. ${message}`
      );
    }

    const detail =
      typeof body?.error === "string" &&
      body.error.trim().length > 0 &&
      body.error !== message
        ? ` (${body.error})`
        : "";

    throw new Error(`${message}${detail}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json().catch(() => {
    throw new Error("Server returned an invalid response. Please try again.");
  }) as Promise<T>;
}

//  Auth 

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload): Promise<{ message: string }> {
  return request<{ message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  }, 30000); 
}

export async function verifyOtp(email: string, otp: string): Promise<{ message: string }> {
  return request<{ message: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function resendOtp(email: string): Promise<{ message: string }> {
  return request<{ message: string }>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const raw = await request<{
    access_token: string;
    user: {
      id: string;
      email: string;
      role: BackendRole;
      firstName?: string;
      lastName?: string;
      registrationNumber?: string;
    };
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setToken(raw.access_token);

  return {
    token: raw.access_token,
    user: {
      id: raw.user.id,
      email: raw.user.email,
      role: normalizeRole(raw.user.role),
      firstName: raw.user.firstName,
      lastName: raw.user.lastName,
      registrationNumber: raw.user.registrationNumber,
    },
  };
}

export async function logout(): Promise<void> {
  
  removeToken();
}

//  Student 

export async function getApplicationStatus(): Promise<ApplicationStatus> {
  try {
    const raw = await request<RawApplicationStatus>("/student/application/status");
    return {
      status: normalizeApplicationStatus(raw.status ?? raw.applicationStatus),
      completedSteps: raw.completedSteps ?? 0,
      totalSteps: raw.totalSteps ?? 4,
      lastSaved: raw.lastSaved ?? null,
      submittedAt: raw.submittedAt ?? null,
    };
  } catch (statusError) {
    try {
      const reviewData = await request<ReviewApplicationResponse>("/review/my-application");
      return deriveStatusFromReviewApplication(reviewData);
    } catch {
      const message =
        statusError instanceof Error
          ? statusError.message
          : "Failed to load application status.";
      throw new Error(message);
    }
  }
}

export async function getStudentNotifications(): Promise<Notification[]> {
  const res = await request<{ success: boolean; data: Notification[] }>("/notifications");
  return res.data ?? [];
}

export async function markNotificationRead(id: string | number): Promise<void> {
  return request<void>(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead(): Promise<void> {
  return request<void>("/notifications/read-all", { method: "PATCH" });
}

export async function clearAllNotifications(): Promise<void> {
  return request<void>("/notifications", { method: "DELETE" });
}

export async function submitApplication(payload: unknown): Promise<SubmitApplicationResponse> {
  return request<SubmitApplicationResponse>("/review/submit-application", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function saveApplicationDraft(payload: unknown): Promise<void> {
  return request<void>("/student/application/draft", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

//  Admin 

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/admin/dashboard/stats");
}

export async function getAdminNotifications(): Promise<Notification[]> {
  const res = await request<{ success: boolean; data: Notification[] }>("/admin/notifications");
  return res.data ?? [];
}

export async function markAdminNotificationRead(id: string | number): Promise<void> {
  return request<void>(`/admin/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  return request<void>("/admin/notifications/read-all", { method: "PATCH" });
}

export async function clearAllAdminNotifications(): Promise<void> {
  return request<void>("/admin/notifications", { method: "DELETE" });
}

export interface ApplicantScoreComponent {
  score: number;
  maximumScore: number;
  percentage: number;
}

export interface ApplicantScoreBreakdown {
  userId: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  academicScore: ApplicantScoreComponent;
  familyBackgroundScore: ApplicantScoreComponent;
  educationBackgroundScore: ApplicantScoreComponent;
  integrityCheckScore: ApplicantScoreComponent;
  disabilityScore: ApplicantScoreComponent;
  totalScore: number;
  maximumTotalScore: number;
  overallPercentage: number;
  isFlagged: boolean;
  flagReasons: string[];
}

export async function getApplicantScoreBreakdown(userId: string): Promise<ApplicantScoreBreakdown> {
  return request<ApplicantScoreBreakdown>("/ranking/comprehensive/calculate", {
    method: "POST",
    body: JSON.stringify({ userId }),
  }, 15000);
}

export async function getAdminApplicantDetails(userId: string): Promise<AdminApplicantDetailsResponse> {
  return request<AdminApplicantDetailsResponse>(`/admin/users/${userId}`);
}

export async function reviewAdminApplicant(
  userId: string,
  payload: ReviewAdminApplicantPayload,
): Promise<{ message: string; applicant: AdminApplicantProfile }> {
  return request<{ message: string; applicant: AdminApplicantProfile }>(`/admin/users/${userId}/review`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getApprovedAdminApplicants(): Promise<AdminApplicantsByStatusResponse> {
  return request<AdminApplicantsByStatusResponse>("/admin/applications/approved");
}

export async function getFlaggedAdminApplicants(): Promise<AdminApplicantsByStatusResponse> {
  return request<AdminApplicantsByStatusResponse>("/admin/applications/flagged");
}

export interface AdminApplicantsResponse {
  count: number;
  applicants: PriorityStudent[];
}

export async function getAllAdminApplicants(): Promise<AdminApplicantsResponse> {
  return request<AdminApplicantsResponse>("/admin/applications");
}

export async function getSponsors(): Promise<SponsorListItem[]> {
  return request<SponsorListItem[]>("/sponsors");
}

export async function getSponsorDetails(id: string): Promise<SponsorDetails> {
  return request<SponsorDetails>(`/sponsors/${id}`);
}

export async function createSponsor(payload: {
  name: string;
  requestedSlots: number;
  logo?: File | null;
}): Promise<SponsorDetails> {
  const token = getToken();
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("requestedSlots", String(payload.requestedSlots));
  if (payload.logo) {
    formData.append("logo", payload.logo);
  }

  const res = await fetch(`${BASE_URL}/sponsors`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body?.message === "string" && body.message.trim().length > 0
        ? body.message
        : typeof body?.error === "string" && body.error.trim().length > 0
          ? body.error
          : `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return res.json() as Promise<SponsorDetails>;
}

export function getAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BASE_URL}${path}`;
}

// ── Disbursement / Transfers ──────────────────────────────────────────────────

export type TransferStatus = "pending" | "success" | "failed";

export interface Transfer {
  id: string;
  reference: string;
  phone: string;
  amount: number;
  currency: string;
  status: TransferStatus;
  provider: string | null;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InitiateTransferPayload {
  phone: string;
  amount: number;
  name: string;
}

export interface InitiateTransferResponse {
  success: boolean;
  message: string;
  data: Transfer;
}

export interface TransferStatusResponse {
  success: boolean;
  message: string;
  data: Transfer;
}

export interface TransferHistoryResponse {
  success: boolean;
  data: Transfer[];
  total: number;
}

export async function initiateTransfer(
  payload: InitiateTransferPayload,
): Promise<InitiateTransferResponse> {
  return request<InitiateTransferResponse>("/transfer", {
    method: "POST",
    body: JSON.stringify(payload),
  }, 30000);
}

export async function getTransferStatus(reference: string): Promise<TransferStatusResponse> {
  return request<TransferStatusResponse>(`/transfer/${reference}/status`);
}

export async function getTransferHistory(): Promise<Transfer[]> {
  const res = await request<TransferHistoryResponse>("/transfer/history");
  return res.data ?? [];
}
