import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DialogService} from "../../shared/services/dialog.service";
import {MsgMessageServiceService} from "../../shared/services/msg-message-service.service";
import {AVIS, bouton_names, date_converte, operations} from "../../constantes";
import {AvisEtudeTechnique, FicheTechniques} from "../../shared/models/ficheTechniques";
import {FicheTechniquesService} from "../../shared/services/fiche-techniques.service";
import {StatutFicheTechniqueService} from "../../shared/services/statut-fiche-technique.service";
import {StatutFicheTechnique} from "../../shared/models/statut-fiche-technique";
import {CategorieProduitService} from "../../shared/services/categorie-produit.service";
import {CategorieProduit} from "../../shared/models/categorie-produit";

interface CategorieProduitDuree {
  id: number;
  libelle: string;
  duree: number;
}

@Component({
  selector: 'app-avis-etute-technique-dialod',
  templateUrl: './avis-etute-technique-dialod.component.html'
})
export class AvisEtuteTechniqueDialodComponent implements OnInit {

  ficheTechnique?: FicheTechniques;
  form: FormGroup;
  mode: string = '';
  title: string = '';
  window_name = ' produit';

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';
  errorMessage: any;
  statutFicheTechniques: StatutFicheTechnique[];
  categorieProduits: CategorieProduit[];
  avisChoices= AVIS;

  dureeService : number;

  categorieProduitDurees: CategorieProduitDuree[] =[
    {
      "id": 1,
      "libelle": "Services fixes",
      "duree": 5
    },
    {
      "id": 2,
      "libelle": "Services mobiles à usage privé",
      "duree": 5
    },
    {
      "id": 3,
      "libelle": "Services mobiles ouverts au public",
      "duree": 5
    },
    {
      "id": 4,
      "libelle": "Services mobiles aéronautiques",
      "duree": 5
    },
    {
      "id": 5,
      "libelle": "Radiodiffusion et télédistribution",
      "duree": 5
    },
    {
      "id": 6,
      "libelle": "Services par satellite",
      "duree": 5
    },
    {
      "id": 7,
      "libelle": "Service amateur & expérimental",
      "duree": 5
    },
    {
      "id": 8,
      "libelle": "Numérotation",
      "duree": 100
    },
    {
      "id": 9,
      "libelle": "Noms de domaine",
      "duree": 3
    },
    {
      "id": 10,
      "libelle": "Services de confiance",
      "duree": 3
    },
    {
      "id": 11,
      "libelle": "Services à valeur ajoutée",
      "duree": 3
    },
    {
      "id": 12,
      "libelle": "Autorisations & agréments",
      "duree": 3
    },
    {
      "id": 13,
      "libelle": "Activités postales",
      "duree": 3
    },
    {
      "id": 14,
      "libelle": "Prestations diverses",
      "duree": 0
    }
  ]

  constructor(
    private ficheTechniquesService: FicheTechniquesService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    private categorieService: CategorieProduitService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    public dialogRef: MatDialogRef<AvisEtuteTechniqueDialodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private msgMessageService: MsgMessageServiceService,
  ) {
    this.ficheTechnique = data.ficheTechnique;
    this.data_operation = data.operation;
  }

  ngOnInit(): void {

    this.statutFicheTechniqueService.getListItems().subscribe((data:FicheTechniques[])=>{
      this.statutFicheTechniques = data;
    });

    this.categorieService.getListItems().subscribe((categorieProduits:CategorieProduit[])=>{
      this.categorieProduits = categorieProduits;
      this.form.get('categorie_produit')?.setValue(this.categorieProduits?.find(c=>c.id===this.ficheTechnique?.categorie_produit)?.libelle);
    });

    this.initForm_update();


    // Auto-renseigner la durée quand l'avis devient DEF
    this.form.get('avis')?.valueChanges.subscribe((avis: string) => {
      if (avis === 'DEF') {
        // Sécurité: si jamais dureeService n'est pas encore fixé, on recalcule
        const catId = this.ficheTechnique?.categorie_produit;
        const duree = this.dureeService ?? this.getDuree(catId as number) ?? 0;

        this.form.patchValue({ duree });
        this.updateDateFin();
      }
    });

  }

  initForm_update() {
    this.form = this.formBuilder.group({
      avis: [this.ficheTechnique?.avis],
      date_debut: [this.ficheTechnique?.date_debut],
      duree: [this.ficheTechnique?.duree],
      date_fin: [this.ficheTechnique?.date_fin],
      client: [this.ficheTechnique?.client_nom],
      categorie_produit: [this.ficheTechnique?.categorie_produit],
      objet: [this.ficheTechnique?.objet],
      commentaire: [this.ficheTechnique?.commentaire],
    });
    this.autoCalculateDateFin();
    this.dureeService=this.getDuree(this.ficheTechnique?.categorie_produit);
  }

  initForm_create() {
    this.form = this.formBuilder.group({
      avis: [''],
      date_debut: [''],
      duree: [''],
      date_fin: [''],
      client: [''],
      categorie_produit: [''],
      commentaire: [''],
    });
    this.autoCalculateDateFin();
  }

  autoCalculateDateFin() {
    this.form.get('date_debut')?.valueChanges.subscribe(() => this.updateDateFin());
    this.form.get('duree')?.valueChanges.subscribe(() => this.updateDateFin());
  }

  getDuree(id: number): number  {
    const item = this.categorieProduitDurees.find(c => c.id === +id);
    return item?.duree ?? 0;
  }


  updateDateFin() {
    const dateDebut = this.form.get('date_debut')?.value;
    const duree = this.form.get('duree')?.value;

    if (dateDebut && duree >= 0) {
      const date = new Date(dateDebut);
      date.setFullYear(date.getFullYear() + Number(duree)); // Ajoute la durée en années
      this.form.get('date_fin')?.setValue(date);
    }
  }


  crud() {
    const avisEtudeTechnique: AvisEtudeTechnique = new AvisEtudeTechnique();
    const formValue = this.form.value;
    avisEtudeTechnique.fiche_technique = this.ficheTechnique?.id;
    avisEtudeTechnique.avis = formValue['avis'];
    avisEtudeTechnique.date_debut = date_converte(formValue['date_debut']);
    avisEtudeTechnique.duree = formValue['duree'];
    avisEtudeTechnique.nouveau_statut = 6;

    this.ficheTechniquesService
      .setAvis(avisEtudeTechnique)
      .subscribe(
        (data) => {
          this.msgMessageService.success('Produit enregistrée avec succèss');
          this.dialogRef.close('Yes');
        },
        (error => {
          this.dialogService.alert({message: error.error.message});

          this.errorMessage = error.error.message;
        })
      );
  }
}
