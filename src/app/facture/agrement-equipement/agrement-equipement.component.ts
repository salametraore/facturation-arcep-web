import { Component } from '@angular/core';
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {operations} from "../../constantes";

@Component({
  selector: 'agrement-equipement',
  templateUrl: './agrement-equipement.component.html'
})
export class AgrementEquipementComponent {
  fichetTechnique: FicheTechniques;
  fixeCategorie: number = 12;
  operation: string = operations.table;

  protected readonly operations = operations;

  onGetOperation(operation: string) {
    this.operation = operation;
  }

  onGetFicheTechnique(ficheTechnique: FicheTechniques) {
    this.fichetTechnique = ficheTechnique;
  }
}
