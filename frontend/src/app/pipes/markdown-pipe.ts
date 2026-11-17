import {Pipe, PipeTransform} from '@angular/core';
import {Marked} from 'marked';

const marked = new Marked({
  renderer: {
    html: (_): string => '',
    link: ({href, title, text}): string =>  {
      const titleAttribute = title ? ` title="${title}"` : '';
      return `<a href="${href}"${titleAttribute} target="_blank" rel="noopener">${text}</a>`;
    }
  }
});

@Pipe({
  name: 'markdown',
  standalone: true,
  pure: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return value || '';
    const parsed = marked.parse(value);
    if (typeof parsed !== 'string') return value;
    return parsed;
  }
}
