export interface Group {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  user_ids: [];
}

export class GroupModel {
  id?: number | null;
  name: string | null;
  description: string | null;
  is_active: boolean | null;
  user_ids: [] | null;
  users_data: [] | null;

  constructor(editData?: GroupModel) {
    this.id = editData?.id || null;
    this.name = editData?.name || null;
    this.description = editData?.description || null;
    this.is_active = editData?.is_active || false;
    this.user_ids = editData?.user_ids || null;
    this.users_data = editData?.users_data || null;
  }
}
