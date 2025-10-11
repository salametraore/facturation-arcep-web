import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Dialog} from '../../models/dialog';

@Component({
  selector: 'app-errors-dialog',
  templateUrl: './errors-dialog.component.html',
  styleUrls: ['./errors-dialog.component.scss']
})
export class ErrorsDialogComponent implements OnInit {

  title = 'Opération echouée !';

  constructor(@Inject(MAT_DIALOG_DATA) public data: Dialog) {
  }

  ngOnInit(): void {
  }

}
