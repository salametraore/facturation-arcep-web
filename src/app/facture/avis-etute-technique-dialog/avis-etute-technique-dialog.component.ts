import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DialogService } from "../../shared/services/dialog.service";
import { MsgMessageServiceService } from "../../shared/services/msg-message-service.service";
import { AVIS, bouton_names, date_converte, operations } from "../../constantes";
import { AvisEtudeTechnique, FicheTechniques } from "../../shared/models/ficheTechniques";
import { FicheTechniquesService } from "../../shared/services/fiche-techniques.service";
import { StatutFicheTechniqueService } from "../../shared/services/statut-fiche-technique.service";
import { StatutFicheTechnique } from "../../shared/models/statut-fiche-technique";
import { CategorieProduitService } from "../../shared/services/categorie-produit.service";
import { CategorieProduit } from "../../shared/models/categorie-produit";

interface CategorieProduitDuree {
  id: number;
  libelle: string;
  duree: number; // en années (on convertit en mois)
}

@Component({
  selector: 'app-avis-etute-technique-dialod',
  templateUrl: './avis-etute-technique-dialog.component.html'
})
export class AvisEtuteTechniqueDialogComponent implements OnInit {

  ficheTechnique?: FicheTechniques;
  form: FormGroup;

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  errorMessage: any;
  statutFicheTechniques: StatutFicheTechnique[];
  categorieProduits: CategorieProduit[];
  avisChoices = AVIS;

  // ✅ Bloque multi-clic sur Enregistrer
  isSaving = false;

  categorieProduitDurees: CategorieProduitDuree[] = [
    { id: 1, libelle: "Services fixes", duree: 5 },
    { id: 2, libelle: "Services mobiles à usage privé", duree: 5 },
    { id: 3, libelle: "Services mobiles ouverts au public", duree: 5 },
    { id: 4, libelle: "Services mobiles aéronautiques", duree: 5 },
    { id: 5, libelle: "Radiodiffusion et télédistribution", duree: 5 },
    { id: 6, libelle: "Services par satellite", duree: 5 },
    { id: 7, libelle: "Service amateur & expérimental", duree: 5 },
    { id: 8, libelle: "Numérotation", duree: 100 },
    { id: 9, libelle: "Noms de domaine", duree: 3 },
    { id: 10, libelle: "Services de confiance", duree: 3 },
    { id: 11, libelle: "Services à valeur ajoutée", duree: 3 },
    { id: 12, libelle: "Autorisations & agréments", duree: 3 },
    { id: 13, libelle: "Activités postales", duree: 3 },
    { id: 14, libelle: "Prestations diverses", duree: 0 },
  ];

  constructor(
    private ficheTechniquesService: FicheTechniquesService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    private categorieService: CategorieProduitService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogService: DialogService,
    public dialogRef: MatDialogRef<AvisEtuteTechniqueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.ficheTechnique = data.ficheTechnique;
    this.data_operation = data.operation;
  }

  ngOnInit(): void {
    // ✅ 1) Créer le form d'abord
    this.initForm_update();

    // ✅ 2) Charger listes
    this.statutFicheTechniqueService.getListItems().subscribe((data: StatutFicheTechnique[]) => {
      this.statutFicheTechniques = data;
    });

    this.categorieService.getListItems().subscribe((cats: CategorieProduit[]) => {
      this.categorieProduits = cats;
      const lib = cats.find(c => c.id === this.ficheTechnique?.categorie_produit)?.libelle ?? '';
      this.form.get('categorie_produit_libelle')?.setValue(lib, { emitEvent: false });
    });

    // ✅ 3) Appliquer règles sur l'état initial
    this.applyAvisRules(this.form.get('avis')?.value);

    // ✅ 4) Appliquer règles à chaque changement d'avis (UNE seule subscription)
    this.form.get('avis')?.valueChanges.subscribe((avis: string) => {
      this.applyAvisRules(avis);
    });
  }

  initForm_update() {
    this.form = this.formBuilder.group({
      avis: [this.ficheTechnique?.avis],
      date_debut: [this.ficheTechnique?.date_debut],
      duree: [this.ficheTechnique?.duree],              // en mois maintenant
      date_fin: [this.ficheTechnique?.date_fin],
      client: [this.ficheTechnique?.client_nom],
      categorie_produit: [this.ficheTechnique?.categorie_produit], // ID
      categorie_produit_libelle: [''],                  // libellé affiché
      objet: [this.ficheTechnique?.objet],
      commentaire: [this.ficheTechnique?.commentaire],
    });

    this.autoCalculateDateFin();
    this.updateDateFin(); // calc initial si possible
  }

  autoCalculateDateFin() {
    this.form.get('date_debut')?.valueChanges.subscribe(() => this.updateDateFin());
    this.form.get('duree')?.valueChanges.subscribe(() => this.updateDateFin());
  }

  private applyAvisRules(avis: string) {
    const dureeCtrl = this.form.get('duree');
    if (!dureeCtrl) return;

    if (avis === 'FAV') {
      dureeCtrl.enable({ emitEvent: false });

      const catId = Number(this.form.get('categorie_produit')?.value ?? this.ficheTechnique?.categorie_produit);
      const def = this.getDureeMois(catId) ?? 0;

      dureeCtrl.setValue(def, { emitEvent: true }); // ✅ toujours
      this.updateDateFin();
    } else {
      dureeCtrl.disable({ emitEvent: false });
      this.updateDateFin();
    }


    this.updateDateFin();
  }

  getDureeMois(id: number): number {
    const item = this.categorieProduitDurees.find(c => c.id === +id);
    const dureeAnnees = item?.duree ?? 0;
    return dureeAnnees * 12;
  }

  private addMonthsSafe(dateInput: any, monthsInput: any): Date | null {
    if (!dateInput && dateInput !== 0) return null;

    const months = Number(monthsInput);
    if (Number.isNaN(months) || months < 0) return null;

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;

    const day = d.getDate();
    const target = new Date(d);

    target.setDate(1);
    target.setMonth(target.getMonth() + months);

    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(day, lastDay));

    return target;
  }

  updateDateFin() {
    const dateDebut = this.form.get('date_debut')?.value;
    const duree = this.form.get('duree')?.value;

    const dateFin = this.addMonthsSafe(dateDebut, duree);

    if (!dateFin) {
      this.form.get('date_fin')?.setValue(null, { emitEvent: false });
      return;
    }

    this.form.get('date_fin')?.setValue(dateFin, { emitEvent: false });
  }

  crud() {
    if (this.isSaving) return;
    this.isSaving = true;

    const formValue = this.form.getRawValue(); // ✅ inclut duree même si disabled

    const avisEtudeTechnique: AvisEtudeTechnique = new AvisEtudeTechnique();
    avisEtudeTechnique.fiche_technique = this.ficheTechnique?.id;
    avisEtudeTechnique.avis = formValue['avis'];
    avisEtudeTechnique.date_debut = date_converte(formValue['date_debut']);
    avisEtudeTechnique.duree = formValue['duree'];
    avisEtudeTechnique.nouveau_statut = 6;

    this.ficheTechniquesService.setAvis(avisEtudeTechnique).subscribe(
      () => {
        this.msgMessageService.success('Produit enregistrée avec succèss');
        this.dialogRef.close('Yes');
      },
      (error) => {
        this.dialogService.alert({ message: error.error.message });
        this.errorMessage = error.error.message;

        this.isSaving = false; // ✅ retry autorisé
      }
    );
  }

}
