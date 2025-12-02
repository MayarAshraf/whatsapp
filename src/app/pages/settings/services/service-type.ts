export interface Settings {
  id: number;
  phone_number_id: number;
  phone_number: number;
  waba_id: number;
  client_id: number;
  client_secret: string;
  access_token: string;
  display_name: string;
  status: string;
}

export class SettingsModel {
  id?: number | null;
  phone_number_id: number | null;
  phone_number: number | null;
  waba_id: number | null;
  client_id: number | null;
  client_secret: string | null;
  access_token: string | null;
  display_name: string | null;
  status: 'active' | 'inactive';

  constructor(editData?: SettingsModel) {
    this.id = editData?.id || null;
    this.phone_number_id = editData?.phone_number_id || null;
    this.phone_number = editData?.phone_number || null;
    this.waba_id = editData?.waba_id || null;
    this.client_id = editData?.client_id || null;
    this.client_secret = editData?.client_secret || null;
    this.access_token = editData?.access_token || null;
    this.display_name = editData?.display_name || null;
    this.status = editData?.status ?? 'inactive';
  }
}
