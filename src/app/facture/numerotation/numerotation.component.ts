import { Component } from '@angular/core';
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {operations} from "../../constantes";

@Component({
  selector: 'numerotation',
  templateUrl: './numerotation.component.html',
  styleUrl: './numerotation.component.scss'
})
export class NumerotationComponent {

  fichetTechnique: FicheTechniques;
  fixeCategorie: number = 8;
  operation: string = operations.table;

  protected readonly operations = operations;

  onGetOperation(operation: string) {
    this.operation = operation;
  }

  onGetFicheTechnique(ficheTechnique: FicheTechniques) {
    this.fichetTechnique = ficheTechnique;
  }
}
