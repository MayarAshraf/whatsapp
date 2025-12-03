import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkify',
})
export class LinkifyPipe implements PipeTransform {
  transform(text: any): { type: 'text' | 'link'; value: string }[] {
    if (!text) return [];

    const urlRegex = /(https?:\/\/[^\s]+)|((www\.)[^\s]+)/gi;
    const emailRegex = /[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}/gi;

    const combinedRegex = new RegExp(
      `${urlRegex.source}|${emailRegex.source}`,
      'gi'
    );

    const segments: { type: 'text' | 'link'; value: string }[] = [];
    let lastIndex = 0;

    let match;
    while ((match = combinedRegex.exec(text)) !== null) {
      const matched = match[0];
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          value: text.slice(lastIndex, match.index),
        });
      }

      segments.push({
        type: 'link',
        value: matched,
      });

      lastIndex = match.index + matched.length;
    }

    if (lastIndex < text.length) {
      segments.push({
        type: 'text',
        value: text.slice(lastIndex),
      });
    }

    return segments;
  }
}
