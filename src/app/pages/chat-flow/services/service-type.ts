export interface Template {
  id: number;
  name: string;
  message_text: string;
  level_type: string;
  order: number;
  parent_department_id: number;
  is_active: boolean;
  options: TemplateOption[];
}

export interface TemplateOption {
  title: string | null;
  department_id: number | null;
  subrole_id: number | null;
  order: number | null;
  is_active: boolean;
  next_node_id?: string | null;
}

export class TemplateModel {
  id?: number | null;
  name: string | null;
  message_text: string | null;
  level_type: string | null;
  order: number | null;
  is_active: boolean;
  parent_department_id: number | null;
  options: TemplateOption[];

  constructor(editData?: Partial<TemplateModel>) {
    this.id = editData?.id || null;
    this.name = editData?.name || null;
    this.message_text = editData?.message_text || null;
    this.level_type = editData?.level_type || null;
    this.order = editData?.order ?? null;
    this.is_active = editData?.is_active ?? true;
    this.parent_department_id = editData?.parent_department_id ?? null;
    this.options = editData?.options?.length
      ? editData.options
      : [
          {
            title: null,
            department_id: null,
            subrole_id: null,
            order: null,
            is_active: true,
            next_node_id: null,
          },
        ];
  }
}
