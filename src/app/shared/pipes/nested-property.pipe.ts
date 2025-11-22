import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "nestedProperty" })
export class NestedPropertyPipe implements PipeTransform {
  transform(value: any, field: string | undefined | null) {
    if (!value || !field) return null;
    // using dot notation inside a string, doesn't work.
    // parse the 'field' string and return the correct nested property if it exists
    return field.split(".").reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, value || self);
    // this pipe will return value['x']['y']
  }
}
