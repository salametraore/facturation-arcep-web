import { Component } from '@angular/core';
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {operations} from "../../constantes";

@Component({
  selector: 'frequences',
  templateUrl: './frequences.component.html'
})
export class FrequencesComponent {

  fichetTechnique: FicheTechniques;

  frequencesCategories = [1,2,3,4,5,6,7];
  operation: string = operations.table;

  protected readonly operations = operations;

  onGetOperation(operation: string) {
    this.operation = operation;
  }

  onGetFicheTechnique(ficheTechnique: FicheTechniques) {
    this.fichetTechnique = ficheTechnique;
  }
}
