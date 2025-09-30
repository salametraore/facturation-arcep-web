import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'periode'
})
export class Periode implements PipeTransform {
  transform(value: string): string {
    // Vérification de la validité de la date
    const dateParts = value?.split('/');
    if (dateParts?.length !== 3) {
      return value;
    }
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return value;
    }
    // Concaténation de l'année et du mois au format 'yyyy-mm'
    return `${year}${month < 10 ? '0' : ''}${month}`;
  }
}
