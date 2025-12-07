export interface Group {
  id: number;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  sub_roles: [];
}

export class GroupModel {
  id?: number | null;
  name_en: string | null;
  name_ar: string | null;
  is_active: boolean | null;
  sub_roles: SubRoleModel[] | null;
  has_subroles: boolean;

  constructor(editData?: GroupModel) {
    this.id = editData?.id || null;
    this.name_en = editData?.name_en || null;
    this.name_ar = editData?.name_ar || null;
    this.is_active = editData?.is_active || false;
    this.sub_roles = editData?.sub_roles?.length
      ? editData.sub_roles
      : [
          {
            name_en: null,
            name_ar: null,
            is_active: false,
          },
        ];
    this.has_subroles = editData?.sub_roles?.length ? true : false;
  }
}

export interface SubRoleModel {
  name_en: string | null;
  name_ar: string | null;
  is_active: boolean;
}
