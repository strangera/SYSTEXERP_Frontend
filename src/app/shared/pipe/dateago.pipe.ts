import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
	name: 'DateAgo',
})
export class DateAgoPipe implements PipeTransform {
	transform(value: any) {
		if (value) {
			const oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
			const today = new Date();
			const firstDate = new Date(today.getFullYear(),  today.getMonth() + 1, today.getDate());

			const nextDate = new Date(value);
			const secondDate = new Date(nextDate.getFullYear(),  nextDate.getMonth() + 1, nextDate.getDate());
			const diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
      if (diffDays === 0) {
				return 'Today';
			} else {
				return diffDays + ' days to go';
			}
		}
		return value;
	}
}
