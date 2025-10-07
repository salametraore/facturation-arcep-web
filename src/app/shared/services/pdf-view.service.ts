import { Injectable } from '@angular/core';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {PdfComponent} from "../components/pdf/pdf.component";


@Injectable({
  providedIn: 'root'
})
export class PdfViewService {

  constructor(public dialog: MatDialog) { }

  view(response:any){
    let file = new Blob([response], {type: 'application/pdf'});
    var fileURL = URL.createObjectURL(file);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1200px';
    dialogConfig.height = '700px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = {fileURL};
    dialogConfig.disableClose = true;
    let ref = this.dialog.open(PdfComponent, dialogConfig);
    ref.afterClosed().subscribe(() => {
    }, error => {
    });
  }

  printDirectly(response: any) {
    const file = new Blob([response], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = fileURL;

    document.body.appendChild(iframe);

    const afterPrintHandler = () => {
      document.body.removeChild(iframe);
      window.removeEventListener('afterprint', afterPrintHandler);
      URL.revokeObjectURL(fileURL); // Nettoyage
    };

    iframe.onload = () => {
      window.addEventListener('afterprint', afterPrintHandler);
      iframe.contentWindow?.print();
    };
  }

}
