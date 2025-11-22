export interface User {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  email_verified?: boolean;
  role?: string | null;
  role_id?: number;
  role_slug?: string;
  created_at?: string;
  featured_image?: string;
}
export class UserModel {
  id?: number | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  password: string | null;
  password_confirmation: string | null;
  role_id: number | null;
  featured_image: string | null;
  job_title: string | null;
  company_name: string | null;
  organization_id: number | null;
  organization: { [key: string]: any } | null;
  country_code: string | null;

  constructor(editData?: UserModel, currentLang?: string) {
    this.id = editData?.id || null;
    this.first_name = editData?.first_name || null;
    this.last_name = editData?.last_name || null;
    this.username = editData?.username || null;
    this.email = editData?.email || null;
    this.phone = editData?.phone || null;
    this.whatsapp_number = editData?.whatsapp_number || null;
    this.password = editData?.password || null;
    this.password_confirmation = editData?.password_confirmation || null;
    this.role_id = editData?.role_id || null;
    this.featured_image = editData?.featured_image || null;
    this.job_title = editData?.job_title || null;
    this.company_name = editData?.company_name || null;
    this.organization = editData?.organization
      ? {
          label:
            currentLang === 'en'
              ? editData?.organization.name_en
              : editData?.organization.name_ar,
          value: editData?.organization.id,
        }
      : null;
    this.organization_id = editData?.organization_id || null;
    this.country_code = editData?.country_code || 'eg';
  }
}
