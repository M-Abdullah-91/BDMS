import { api } from './client';

export type Role = 'donor' | 'hospital_admin' | 'system_admin';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  phone: string;
  city: string;
}

export interface DonorProfile {
  id: number;
  user: User;
  blood_group: string;
  date_of_birth: string | null;
  weight_kg: number | null;
  is_verified: boolean;
  verified_at: string | null;
  available: boolean;
  last_donation_date: string | null;
  is_eligible: boolean;
  next_eligible_date: string;
  days_until_eligible: number;
}

export interface Hospital {
  id: number;
  name: string;
  address?: string;
  city: string;
  phone: string;
  license_number?: string;
}

export interface InventoryItem {
  id: number;
  hospital: number;
  hospital_name: string;
  hospital_city: string;
  blood_group: string;
  units: number;
  updated_at: string;
}

export interface BloodRequest {
  id: number;
  hospital: Hospital;
  blood_group: string;
  units_needed: number;
  patient_name: string;
  urgency: 'low' | 'normal' | 'high' | 'critical';
  status: 'open' | 'fulfilled' | 'cancelled';
  city: string;
  notes: string;
  needed_by: string | null;
  response_count: number;
  created_at: string;
}

export interface Donation {
  id: number;
  donor: number;
  donor_name: string;
  hospital: number;
  hospital_name: string;
  blood_group: string;
  units: number;
  donation_date: string;
  notes: string;
  created_at: string;
}

// Auth
export const login = (username: string, password: string) =>
  api.post<{ access: string; refresh: string }>('/auth/login/', { username, password });

export const register = (payload: Record<string, unknown>) =>
  api.post<{ user: User; access: string; refresh: string }>('/auth/register/', payload);

export const fetchMe = () => api.get<User>('/auth/me/');
export const updateMe = (payload: Partial<User>) => api.patch<User>('/auth/me/', payload);

// Donor
export const fetchMyDonorProfile = () => api.get<DonorProfile>('/donors/me/');
export const updateMyDonorProfile = (payload: Partial<DonorProfile>) =>
  api.patch<DonorProfile>('/donors/me/', payload);
export const fetchEligibility = () => api.get('/donors/me/eligibility/');
export const fetchMyLabReports = () => api.get('/donors/me/reports/');
export const uploadLabReport = (form: FormData) =>
  api.post('/donors/reports/upload/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const fetchPendingReports = () => api.get('/donors/reports/pending/');
export const reviewReport = (id: number, action: 'approve' | 'reject', note?: string) =>
  api.post(`/donors/reports/${id}/review/`, { action, review_note: note ?? '' });
export const searchDonors = (params: Record<string, string | undefined>) =>
  api.get('/donors/search/', { params });

// Hospital
export const fetchMyHospital = () => api.get<Hospital>('/hospitals/me/');
export const updateMyHospital = (payload: Partial<Hospital>) =>
  api.patch<Hospital>('/hospitals/me/', payload);
export const listHospitals = (params?: Record<string, string | undefined>) =>
  api.get('/hospitals/', { params });

// Inventory
export const fetchMyInventory = () => api.get('/inventory/me/');
export const createInventoryItem = (payload: { blood_group: string; units: number }) =>
  api.post('/inventory/me/', payload);
export const updateInventoryItem = (id: number, payload: { units: number }) =>
  api.patch(`/inventory/me/${id}/`, payload);
export const deleteInventoryItem = (id: number) => api.delete(`/inventory/me/${id}/`);
export const fetchPublicInventory = (params?: Record<string, string | undefined>) =>
  api.get('/inventory/', { params });

// Requests
export const fetchBloodRequests = (params?: Record<string, string | undefined>) =>
  api.get('/requests/', { params });
export const fetchMatchingRequests = () => api.get('/requests/', { params: { matching: '1' } });
export const fetchBloodRequest = (id: number) => api.get<BloodRequest>(`/requests/${id}/`);
export const createBloodRequest = (payload: Partial<BloodRequest>) =>
  api.post('/requests/', payload);
export const updateRequestStatus = (id: number, status: string) =>
  api.patch(`/requests/${id}/status/`, { status });
export const respondToRequest = (id: number, message?: string) =>
  api.post(`/requests/${id}/respond/`, { message: message ?? '' });
export const fetchRequestResponses = (id: number) => api.get(`/requests/${id}/responses/`);
export const fetchMyResponses = () => api.get('/requests/my-responses/');

// Donations
export const recordDonation = (payload: {
  donor_id: number;
  blood_group: string;
  units: number;
  donation_date: string;
  related_request?: number | null;
  notes?: string;
}) => api.post('/donations/record/', payload);
export const fetchMyDonations = () => api.get('/donations/mine/');
export const fetchHospitalDonations = () => api.get('/donations/hospital/');
