import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'locationSplit',
  standalone: true
})
export class LocationSplitPipe implements PipeTransform {
  transform(value: string | null | undefined): string[] {
    if (!value) return [];
    // 把 "A01,B02,C03" 切成 ['A01', 'B02', 'C03']
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
}
