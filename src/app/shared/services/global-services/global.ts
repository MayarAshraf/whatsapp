// Global types (models/entities)
export interface GlobalApiResponse {
  message: string;
  status: boolean;
  data: any;
}

export interface LoginModel {
  email: string;
  password: string;
}

export interface RegisterModel {
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  phone: string;
  whatsapp_number: string;
  country_code: string;
  job_title: string;
  company_name: string;
  password: string;
  password_confirmation: string;
}

export interface ForgetModel {
  email: string;
}

export interface VerifyModel {
  token: string;
  checkExpireResetTokenPage: boolean;
}

export interface ResetModel {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface PhoneModel {
  phone: string;
  country_code: string;
}
