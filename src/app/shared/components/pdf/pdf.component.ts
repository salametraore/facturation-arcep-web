import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent {

  pdfFile: any = '';

  constructor(public dialogRef: MatDialogRef<PdfComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.pdfFile = data.fileURL;
  }

  printPDF() {
    if (this.pdfFile) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = this.pdfFile;

      document.body.appendChild(iframe);

      // Écouteur pour l'événement 'afterprint' global
      const afterPrintHandler = () => {
        document.body.removeChild(iframe);
        window.removeEventListener('afterprint', afterPrintHandler); // Retirer l'écouteur après utilisation
      };

      // Attendre que l'iframe soit chargée avant d'imprimer
      iframe.onload = () => {
        window.addEventListener('afterprint', afterPrintHandler); // Attacher l'événement
        iframe.contentWindow?.print(); // Déclencher l'impression
      };
    }
  }

}
