import { Injectable } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Injectable({ providedIn: "root" })
export class FieldBuilderService {
  defaultGridClass = "formgrid grid align-items-end";

  fieldBuilder = (fieldGroup: FormlyFieldConfig[], className = this.defaultGridClass) => {
    fieldGroup.forEach(field => {
      field.className = field.className || this.getFieldClass(fieldGroup) || "";
    });

    return {
      fieldGroupClassName: className,
      fieldGroup: fieldGroup,
    };
  };

  /*****************************************/

  getFieldClass = (fieldGroup: FormlyFieldConfig[]): string => {
    const fieldGroupLength = fieldGroup.length;
    switch (fieldGroupLength) {
      case 1:
        return "col";
      case 2:
      case 3:
        return "col-12 md:col";
      case 4:
        return "col-12 xl:col lg:col-4 md:col-6";
      case 5:
      case 6:
        return "col-12 lg:col md:col-4";
      default:
        return "col";
    }
  };
}
