import {Component, Input, OnInit} from '@angular/core';
import { FicheTechniques} from "../../shared/models/ficheTechniques";
import {AVIS} from "../../constantes";

@Component({
  selector: 'avis-technique-infos',
  templateUrl: './avis-technique-infos.component.html',
  styleUrl: './avis-technique-infos.component.scss'
})
export class AvisTechniqueInfosComponent implements OnInit{

  @Input() ficheTechnique:FicheTechniques;

  avis:any;
  date_debut:any;
  duree:any;
  date_fin:any;
  statut:any;

  ngOnInit() {
      this.avis = AVIS.find(a => a.value === this.ficheTechnique.avis)?.label;
      this.date_debut = this.ficheTechnique.date_debut;
      this.duree = this.ficheTechnique.duree;
      this.date_fin = this.ficheTechnique.date_fin;
      this.statut = this.ficheTechnique.statut?.libelle;
  }
}
