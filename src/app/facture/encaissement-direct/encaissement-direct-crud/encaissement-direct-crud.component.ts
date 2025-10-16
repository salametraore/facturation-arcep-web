import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl,FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { Produit } from '../../../shared/models/produit';
import { Client } from '../../../shared/models/client';
import { ModePaiement } from '../../../shared/models/mode-paiement';
import { ZoneCouverture } from '../../../shared/models/zone-couverture';

import {
  EncaissementDirectFicheTechniqueRequest,
  EncaissementDirectDTO,
  FicheTechniqueDirectDTO,
  ProduitDetail,
  ProduitDetailForPayload
} from '../../../shared/models/encaissement-direct-request';

import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';
import { ProduitService } from '../../../shared/services/produits.service';
import { ClientService } from '../../../shared/services/client.service';
import { EncaissementsService } from '../../../shared/services/encaissements.service';
import { FicheTechniquesService } from '../../../shared/services/fiche-techniques.service';
import { ZoneCouvertureService } from '../../../shared/services/zone-couverture.service';
import { ModePaiementService } from '../../../shared/services/mode-paiement.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';
import {bouton_names, date_converte, operations} from "../../../constantes";

@Component({
  selector: 'app-encaissement-direct-crud',
  templateUrl: './encaissement-direct-crud.component.html',
  styleUrls: ['./encaissement-direct-crud.component.scss']
})
export class EncaissementDirectCrudComponent implements OnInit {

  encaissementForm!: FormGroup;
  ficheForm!: FormGroup;
  produitsDS = new MatTableDataSource<FormGroup>([]);
  displayedColumns = ['produit', 'designation', 'quantite', 'prix_unitaire', 'total', 'actions'];

  clientDisplay = new FormControl<string>('');

  categories: CategorieProduit[] = [];
  produitsAll: Produit[] = [];
  produitsFiltered: Produit[] = [];
  clients: Client[] = [];
  modePaiements: ModePaiement[] = [];
  zoneCouverture: ZoneCouverture[] = [];

  nomClient: string | null = null;

  get produitsFormArray(): FormArray<FormGroup> {
    return this.ficheForm.get('produits_detail') as FormArray<FormGroup>;
  }

  constructor(
    private fb: FormBuilder,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private encaissementsService: EncaissementsService,
    private ficheTechniquesService: FicheTechniquesService,
    private zoneCouvertureService: ZoneCouvertureService,
    private modePaiementService: ModePaiementService,
    private msg: MsgMessageServiceService,
    public dialogRef: MatDialogRef<EncaissementDirectCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadData();
    this.linkClientFields();
    this.addProduitLine();
  }

  /** --------- INITIALISATION DES FORMULAIRES --------- */
  private initForms(): void {
    this.encaissementForm = this.fb.group({
      date_encaissement: [new Date(), Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
      affecte: [0, [Validators.min(0)]],
      penalites: [0],
      solde_non_affecte: [0],
      reference: [''],
      objet: ['Encaissement Frais de dossier'],
      mode_paiement: [null, Validators.required],
      client: [null, Validators.required],
    });

    this.ficheForm = this.fb.group({
      client: [null, Validators.required],
      direction: [1],
      utilisateur: [1],
      produits_detail: this.fb.array([]),
      date_creation: [new Date().toISOString()],
      position: [1],
      position_direction: [1],
      categorie_produit: [null, Validators.required],
      objet: [''],
      commentaire: [''],
    });
  }

  /** --------- CHARGEMENT DES DONNÉES --------- */
  private loadData(): void {
    this.categorieProduitService.getListItems()
      .subscribe(c => this.categories = (c || []).filter(x => [11, 12, 13].includes(x.id)));

    this.produitService.getListItems()
      .subscribe(p => this.produitsAll = p || []);

    this.clientService.getItems()
      .subscribe(cl => this.clients = cl);

    this.zoneCouvertureService.getListItems()
      .subscribe(z => this.zoneCouverture = (z || []).filter(zz => zz.categorie_produit === 13));

    this.modePaiementService.getItems()
      .subscribe((modes: ModePaiement[]) => this.modePaiements = modes);

    const id = this.encaissementForm.get('client')!.value;
    if (id) {
      const c = this.clients.find(x => x.id === id);
      if (c) this.clientDisplay.setValue(c.denomination_sociale, { emitEvent: false });
    }
  }

  /** --------- SYNCHRONISATION CLIENT --------- */
  private linkClientFields(): void {
    const clientId = this.encaissementForm.get('client')!.value;
    if (clientId) this.ficheForm.patchValue({ client: clientId }, { emitEvent: false });

    this.encaissementForm.get('client')!.valueChanges.subscribe((id: number) => {
      this.ficheForm.patchValue({ client: id }, { emitEvent: false });
    });
  }

  /** --------- CHANGEMENT DE CATÉGORIE PRODUIT --------- */
  onCategorieChange(): void {
    const cat = this.ficheForm.get('categorie_produit')!.value;

    this.produitsFiltered = (this.produitsAll || []).filter(p =>
      p.categorieProduit === cat && (cat !== 13 || p.id === 81)
    );

    this.produitsFormArray.controls.forEach((fg: FormGroup) => {
      const currentProd = fg.get('produit')!.value;

      if (!this.produitsFiltered.some(p => p.id === currentProd)) {
        fg.patchValue({ produit: (cat === 13 ? 81 : null) }, { emitEvent: false });
      }

      // Nettoyage des champs
      if (cat === 11) {
        fg.patchValue({ marque: '', modele: '', zone_couverture: null });
      } else if (cat === 12) {
        fg.patchValue({ designation: '', zone_couverture: null });
      } else if (cat === 13) {
        fg.patchValue({ designation: '', marque: '', modele: '' });
      } else {
        fg.patchValue({ marque: '', modele: '', zone_couverture: null });
      }
    });

    // Colonnes affichées
    this.displayedColumns =
      cat === 11 ? ['produit', 'designation', 'quantite', 'prix_unitaire', 'total', 'actions'] :
        cat === 12 ? ['produit', 'marque', 'modele', 'quantite', 'prix_unitaire', 'total', 'actions'] :
          cat === 13 ? ['produit', 'zone', 'quantite', 'prix_unitaire', 'total', 'actions'] :
            ['produit', 'designation', 'quantite', 'prix_unitaire', 'total', 'actions'];
  }

  /** --------- GESTION DES PRODUITS --------- */
  addProduitLine(): void {
    const fg = this.fb.group({
      produit: [null, Validators.required],
      produit_libelle: [''],
      designation: [''],
      marque: [''],
      modele: [''],
      zone_couverture: [null],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prix_unitaire: [0, [Validators.required, Validators.min(0)]],
      total: [{ value: 0, disabled: true }],
    });

  // total auto
    fg.valueChanges.subscribe(() => {
      const q = +fg.get('quantite')!.value || 0;
      const pu = +fg.get('prix_unitaire')!.value || 0;
      fg.get('total')!.setValue(q * pu, { emitEvent: false });
    });

    // >>> maj du libellé produit quand l'id change
    fg.get('produit')!.valueChanges.subscribe((id: number) => {
      const lib = this.produitsAll.find(p => p.id === id)?.libelle ?? '';
      fg.get('produit_libelle')!.setValue(lib, { emitEvent: false });
    });

    this.produitsFormArray.push(fg);
    this.refreshDS();
  }

  removeProduitLine(i: number): void {
    this.produitsFormArray.removeAt(i);
    this.refreshDS();
  }

  refreshDS(): void {
    this.produitsDS.data = this.produitsFormArray.controls as FormGroup[];
  }

  onClientPicked(c: Client) {
    // affiche le nom dans l’input
    this.clientDisplay.setValue(c.denomination_sociale, { emitEvent: false });

    // met l’ID dans les formulaires
    this.encaissementForm.patchValue({ client: c.id }, { emitEvent: false });
    this.ficheForm.patchValue({ client: c.id }, { emitEvent: false });

    // (facultatif) garder un libellé pour résumé
    this.nomClient = c.denomination_sociale;
  }
  /** --------- VALIDATION ET ENVOI --------- */
  submit(): void {
    if (this.encaissementForm.invalid || this.ficheForm.invalid) {
      this.encaissementForm.markAllAsTouched();
      this.ficheForm.markAllAsTouched();
      this.msg.failed('Veuillez corriger les erreurs des formulaires.');
      return;
    }

    const isCat13 = +this.ficheForm.get('categorie_produit')!.value === 13;

    // 1) Produits SANS zone_couverture
    const produits_detail: ProduitDetailForPayload[] =
      this.produitsFormArray.getRawValue().map((l: any): ProduitDetailForPayload => {
        const zone = isCat13 ? this.zoneCouverture.find(zz => zz.id === l.zone_couverture) : undefined;
        const designation = isCat13 ? (zone?.libelle || l.designation) : l.designation;

        const { zone_couverture, ...detailSansZone } = {
          produit: l.produit,
          produit_libelle: this.produitsAll.find(p => p.id === l.produit)?.libelle || l.produit_libelle,
          quantite: +l.quantite,
          prix_unitaire: +l.prix_unitaire,
          designation,
          total: (+l.quantite) * (+l.prix_unitaire),
          plage_numero: l.plage_numero ?? '',
          marque: l.marque ?? '',
          modele: l.modele ?? '',
          zone_couverture: l.zone_couverture,
        };
        return detailSansZone;
      });

    // 2) Types payload locaux pour avoir des dates formatées en string
    type EncaissementDirectPayload =
      Omit<EncaissementDirectDTO, 'date_encaissement'> & { date_encaissement: string };

    type FicheTechniqueDirectPayload =
      Omit<FicheTechniqueDirectDTO, 'produits_detail' | 'date_creation'> & {
      produits_detail: ProduitDetailForPayload[];
      date_creation: string;
    };

    // 3) Encaissement avec date formatée
    const encaissement: EncaissementDirectPayload = {
      ...this.encaissementForm.value,
      date_encaissement: date_converte(this.encaissementForm.value.date_encaissement),
    };

    // 4) Fiche technique avec date_creation formatée
    const fiche_technique: FicheTechniqueDirectPayload = {
      ...this.ficheForm.value,
      date_creation: date_converte(this.ficheForm.value.date_creation),
      produits_detail
    };

    // 5) Payload final (cast si ton service attend les DTO "historiques")
    const payload: EncaissementDirectFicheTechniqueRequest = {
      encaissement: encaissement as unknown as EncaissementDirectDTO,
      fiche_technique: fiche_technique as unknown as FicheTechniqueDirectDTO
    };

    this.encaissementsService.createEncaissementDirect(payload).subscribe({
      next: () => { this.msg.success('Encaissement direct enregistré avec succès.'); this.dialogRef.close(true); },
      error: () => this.msg.failed('Erreur lors de l’enregistrement.')
    });
  }



  /** --------- UTILITAIRES --------- */
  sommeProduits(): number {
    return this.produitsFormArray.controls.reduce((sum, fg: FormGroup) => {
      const q = +fg.get('quantite')?.value || 0;
      const pu = +fg.get('prix_unitaire')?.value || 0;
      return sum + q * pu;
    }, 0);
  }

  getClientName(): string {
    const clientId = this.encaissementForm?.value?.client;
    if (!clientId) return '';
    return this.clients.find(x => x.id === clientId)?.denomination_sociale || '';
  }

  getDesignationOrZone(i: number): string {
    const ctrl = this.produitsFormArray?.at(i);
    if (!ctrl) return '';
    const designation = ctrl.get('designation')?.value;
    if (designation) return designation;
    const zoneId = ctrl.get('zone_couverture')?.value;
    return this.zoneCouverture.find(z => z.id === zoneId)?.libelle || '';
  }

  onFerme(): void {
    this.dialogRef.close('Yes');
  }

  lineTotal(i: number): number { const ctrl = this.produitsFormArray?.at(i); if (!ctrl) { return 0; } const q = +ctrl.get('quantite')?.value || 0; const pu = +ctrl.get('prix_unitaire')?.value || 0; return q * pu; }

  onStepChange(event: StepperSelectionEvent): void {
    // Placeholder si tu veux des actions par étape
  }
}
