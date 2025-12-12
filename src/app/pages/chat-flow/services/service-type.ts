export interface Template {
  id: number;
  name: string;
  order: number;
  is_active: boolean;
  message_type: string;
  interactive_type: string;
  message_content: string;
  options: TemplateOption[];
}

export interface TemplateOption {
  title: string | null;
  action_type: string | null;
  target_step_key?: string | null;
  target_group_id?: number | null;
  target_user_id?: number | null;
}

export class TemplateModel {
  id?: number | null;
  name: string | null;
  order: number | null;
  message_type: string | null;
  interactive_type: string | null;
  message_content: string | null;
  is_active: boolean;
  options: TemplateOption[];

  constructor(editData?: Partial<TemplateModel>) {
    this.id = editData?.id || null;
    this.name = editData?.name || null;
    this.order = editData?.order ?? null;
    this.message_type = editData?.message_type || null;
    this.interactive_type = editData?.interactive_type || null;
    this.message_content = editData?.message_content || null;
    this.is_active = editData?.is_active ?? true;
    this.options = Array.isArray(editData?.options) ? editData.options : [];
  }
}

export class flowModel {
  id?: number | null;
  name: string | null;
  is_active: boolean;
  is_default: boolean;
  description: string | null;

  constructor(editData?: Partial<flowModel>) {
    this.id = editData?.id || null;
    this.description = editData?.description || null;
    this.name = editData?.name || null;
    this.is_active = editData?.is_active ?? true;
    this.is_default = editData?.is_default ?? true;
  }
}
