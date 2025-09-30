import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(items: any[], searchTerm: string): any[] {
    if (!items || !searchTerm) {
      return items;
    }

    if(typeof(searchTerm)!='number')
    searchTerm = searchTerm.toLowerCase();

    return items.filter(item => {
      for (let key in item) {
        if (item.hasOwnProperty(key) && item[key] !== null && item[key].toString().toLowerCase().includes(searchTerm)) {
          return true;
        }
      }
      return false;
    });
  }

}
