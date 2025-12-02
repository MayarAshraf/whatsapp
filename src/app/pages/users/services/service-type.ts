export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  job_title: string | null;
  department_id: number | null;
  subrole_id: number | null;
  is_active: boolean;
}

export class UserModel {
  id?: number | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  password: string | null;
  password_confirmation: string | null;
  job_title: string | null;
  department_id: number | null;
  subrole_id: number | null;
  is_active: boolean;

  constructor(editData?: UserModel) {
    this.id = editData?.id || null;
    this.first_name = editData?.first_name || null;
    this.last_name = editData?.last_name || null;
    this.username = editData?.username || null;
    this.email = editData?.email || null;
    this.phone = editData?.phone || null;
    this.password = null;
    this.password_confirmation = null;
    this.job_title = editData?.job_title || null;
    this.department_id = editData?.department_id || null;
    this.subrole_id = editData?.subrole_id || null;
    this.is_active = editData?.is_active ?? false;
  }
}
