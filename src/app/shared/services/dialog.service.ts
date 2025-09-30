import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {Dialog} from '../models/dialog';
import {map} from 'rxjs/operators';
import {ErrorsDialogComponent} from '../dialogs/errors-dialog/errors-dialog.component';
import {AlerteDialogComponent} from '../dialogs/alerte-dialog/alerte-dialog.component';
import {SuccessDialogComponent} from '../dialogs/success-dialog/success-dialog.component';
import {YesNoComponent} from '../dialogs/yes-no/yes-no.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) {}

  alert(data: Dialog): Observable<boolean> {
    return this.dialog.open(AlerteDialogComponent, {data, width: '500px', disableClose: true}).afterClosed();
  }

  error(data: Dialog): Observable<boolean> {
    return this.dialog.open(ErrorsDialogComponent, {data, width: '500px', disableClose: true}).afterClosed();
  }

  succes(data: Dialog): Observable<boolean> {
    return this.dialog.open(SuccessDialogComponent, {data, width: '500px', disableClose: true}).afterClosed();
  }

  yes_no(data: Dialog, taille?: number): Observable<boolean> {
    if (!taille) {
      taille = 500;
    }
    let ref = this.dialog.open(YesNoComponent, {data, width: taille + 'px', disableClose: true});
    return ref.afterClosed().pipe(map(() => ref.componentInstance.YES_NO));
  }

}
