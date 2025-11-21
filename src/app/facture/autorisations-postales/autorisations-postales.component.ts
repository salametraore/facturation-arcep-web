import { Component } from '@angular/core';
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {operations} from "../../constantes";

@Component({
  selector: 'autorisations-postales',
  templateUrl: './autorisations-postales.component.html'
})
export class AutorisationsPostalesComponent {

  fichetTechnique: FicheTechniques;
  fixeCategorie: number = 13;
  operation: string = operations.table;

  protected readonly operations = operations;

  onGetOperation(operation: string) {
    this.operation = operation;
  }

  onGetFicheTechnique(ficheTechnique: FicheTechniques) {
    this.fichetTechnique = ficheTechnique;
  }
}
