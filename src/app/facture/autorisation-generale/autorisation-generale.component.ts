import { Component } from '@angular/core';
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {operations} from "../../constantes";

@Component({
  selector: 'app-autorisation-generale',
  templateUrl: './autorisation-generale.component.html',
  styleUrl: './autorisation-generale.component.scss'
})
export class AutorisationGeneraleComponent {

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
