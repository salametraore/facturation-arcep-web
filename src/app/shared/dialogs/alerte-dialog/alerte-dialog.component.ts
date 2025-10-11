import {Component, Inject, OnInit} from '@angular/core';
import {Dialog} from '../../models/dialog';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-alerte-dialog',
  templateUrl: './alerte-dialog.component.html',
  styleUrls: ['./alerte-dialog.component.scss']
})
export class AlerteDialogComponent implements OnInit {

  title = 'Opération impossible';

  constructor(@Inject(MAT_DIALOG_DATA) public data: Dialog) {}

  ngOnInit(): void {}


}
