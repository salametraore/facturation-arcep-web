import { Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MsgMessageServiceService {

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private _snackBar: MatSnackBar) {}

  success(msg?:string) {
    if(!msg){
      msg = 'Enregistré avec succès';
    }
    this._snackBar.open(msg, 'fermer', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000,
      panelClass: 'success-save',
    });
  }

  failed(msg?:string) {
    if(!msg){
      msg = 'Echec d\enregistrement';
    }
    this._snackBar.open(msg, 'fermer', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 4000,
      panelClass: 'failed-save'
    });
  }

  failedPWD(msg?:string) {
    if(!msg){
      msg = 'Echec';
    }
    this._snackBar.open(msg, 'fermer', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 4000,
      panelClass: 'failed-save'
    });
  }

  deleteSuccess(msg?:string) {
    if(!msg){
      msg = 'Supprimé avec succès';
    }
    this._snackBar.open(msg, 'fermer', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000,
      panelClass: 'success-save'
    });
  }

  deleteFailed(msg?:string) {
    if(!msg){
      msg = 'Echec de suppression';
    }
    this._snackBar.open(msg, 'fermer', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 4000,
      panelClass: 'failed-save'
    });
  }

}
