import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Dialog} from '../../models/dialog';

@Component({
  selector: 'app-success-dialog',
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.scss']
})
export class SuccessDialogComponent implements OnInit {

  title = 'Opération effectuée avec succès!';

  constructor(@Inject(MAT_DIALOG_DATA) public data: Dialog) {
  }

  ngOnInit(): void {
  }

}
