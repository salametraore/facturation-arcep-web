import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Dialog} from '../../models/dialog';

@Component({
  selector: 'app-yes-no',
  templateUrl: './yes-no.component.html',
  styleUrls: ['./yes-no.component.scss']
})
export class YesNoComponent implements OnInit {

  YES_NO: boolean = false;
  title = 'Demande de confirmation ';

  constructor(public dialogRef: MatDialogRef<YesNoComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Dialog,) {
  }

  ngOnInit(): void {
  }

  oui() {
    this.YES_NO = true;
    this.dialogRef.close();
  }

  non() {
    this.YES_NO = false;
    this.dialogRef.close();
  }
}
