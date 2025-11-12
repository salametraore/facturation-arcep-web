import {Component} from '@angular/core';
import {FicheTechniques} from "../../shared/models/ficheTechniques";
import {operations} from "../../constantes";

@Component({
  selector: 'service-a-valeur-ajoute',
  templateUrl: './service-a-valeur-ajoute.component.html'
})
export class ServiceAValeurAjouteComponent {

  fichetTechnique: FicheTechniques;
  fixeCategorie: number = 11;
  operation: string = operations.table;

  protected readonly operations = operations;

  onGetOperation(operation: string) {
    this.operation = operation;
  }

  onGetFicheTechnique(ficheTechnique: FicheTechniques) {
    this.fichetTechnique = ficheTechnique;
  }
}
