import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupByField', // ✔ 不加 standalone: true 就是傳統 NgModule 管理的方式
  pure: true
})
export class GroupByFieldPipe implements PipeTransform {
  transform<T>(array: T[], field: keyof T): T[][] {
    if (!array || !field) return [];
    const map = new Map<any, T[]>();
    for (const item of array) {
      const key = item[field] ?? '未分類';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.values());
  }
}
