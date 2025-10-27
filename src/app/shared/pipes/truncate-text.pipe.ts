import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "truncateText", standalone: true })
export class TruncateTextPipe implements PipeTransform {
  transform(value: string, limit: number): string {
    if (!value) return "";
    if (value.length <= limit) return value;

    return `${value.slice(0, limit)}...`;
  }
}
