import { TitleCasePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extendedTitleCasePipe',
  standalone: true,
})
export class ExtendedTitleCasePipePipe extends TitleCasePipe implements PipeTransform {
  override transform(value: string): string;
  override transform(value: null | undefined): null;

  override transform(value: string | null | undefined): string | null {
    if (!value) return super.transform(value);

    const splitText = value.replace(/([a-z])([A-Z])/g, '$1 $2');
    return super.transform(splitText);
  }
}
