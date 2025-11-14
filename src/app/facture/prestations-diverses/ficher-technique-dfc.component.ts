import {Component} from '@angular/core';
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {operations} from "../../constantes";

@Component({
  selector: 'app-ficher-technique-dfc',
  templateUrl: './ficher-technique-dfc.component.html'
})
export class FicherTechniqueDfcComponent {

  fichetTechnique: FicheTechniques;
  fixeCategorie: number = 14;
  operation: string = operations.table;

  protected readonly operations = operations;

  onGetOperation(operation: string) {
    this.operation = operation;
  }

  onGetFicheTechnique(ficheTechnique: FicheTechniques) {
    this.fichetTechnique = ficheTechnique;
  }


}
