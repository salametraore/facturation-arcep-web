import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FicheTechniques, MiseAJourStatutFiche } from "../../../shared/models/ficheTechniques";
import { Client } from "../../../shared/models/client";
import { CategorieProduit } from "../../../shared/models/categorie-produit";
import { StatutFicheTechnique } from "../../../shared/models/statut-fiche-technique";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { FicheTechniqueProduit } from "../../../shared/models/ficheTechniquesProduits";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Produit } from "../../../shared/models/produit";
import { FicheTechniquesService } from "../../../shared/services/fiche-techniques.service";
import { CategorieProduitService } from "../../../shared/services/categorie-produit.service";
import { ProduitService } from "../../../shared/services/produits.service";
import { ClientService } from "../../../shared/services/client.service";
import { StatutFicheTechniqueService } from "../../../shared/services/statut-fiche-technique.service";
import { MsgMessageServiceService } from "../../../shared/services/msg-message-service.service";
import { DialogService } from "../../../shared/services/dialog.service";
import { operations, bouton_names } from "../../../constantes";
import { HistoriqueFicheTechnique } from "../../../shared/models/historique-traitement-fiche-technique";
import { startWith, takeUntil, finalize } from 'rxjs/operators';
import { combineLatest, Subject } from 'rxjs';

interface FicheTechniqueProduitRow extends FicheTechniqueProduit {
  __rowKey: string;
  __persisted: boolean;
}

@Component({
  selector: 'service-a-valeur-ajoute-crud',
  templateUrl: './service-a-valeur-ajoute-crud.component.html'
})
export class ServiceAValeurAjouteCrudComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() fixeCategorie: number;
  @Input() ficheTechnique: FicheTechniques;
  @Input() operation: string;

  @Output() notifyFicheTechnique: EventEmitter<FicheTechniques> = new EventEmitter<FicheTechniques>();
  @Output() notifyActionOperation: EventEmitter<string> = new EventEmitter<string>();

  clients: Client[] = [];
  client: Client;

  categories: CategorieProduit[] = [];
  categorie: CategorieProduit;

  statutFicheTechniques: StatutFicheTechnique[] = [];
  statutFicheTechnique: StatutFicheTechnique;

  form_ficheTechnique: FormGroup;
  form_ficheTechniquesProduit: FormGroup;

  t_FicheTechniquesProduits?: MatTableDataSource<FicheTechniqueProduitRow>;
  historiqueFicheTechniques: HistoriqueFicheTechnique[] = [];

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  saveLocked = false;
  transmitLocked = false;
  isTransmitting = false;

  deletedProduitIds: number[] = [];
  editingRowKey: string | null = null;
  private rowSeq = 0;
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = ['produit', 'designation', 'quantite', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  montant_de_la_commade: number = 0;
  produits: Produit[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private ficheTechniquesService: FicheTechniquesService,
    private categorieProduitService: CategorieProduitService,
    private produitService: ProduitService,
    private clientService: ClientService,
    private statutFicheTechniqueService: StatutFicheTechniqueService,
    private msgMessageService: MsgMessageServiceService,
    private dialogService: DialogService,
  ) {
    this.t_FicheTechniquesProduits = new MatTableDataSource<FicheTechniqueProduitRow>([]);
  }

  ngOnInit(): void {
    console.log(this.ficheTechnique);

    this.loadData();
    this.initFormCommandeClient_create();
    this.initFormFicheTechniquesProduit_create();

    if (this.ficheTechnique) {
      this.t_FicheTechniquesProduits.data =
        (this.ficheTechnique?.produits_detail ?? []).map(p => this.toRow(p));

      this.initFormCommandeClient_update();
      this.getMontantTotal(this.t_FicheTechniquesProduits.data);
    }
  }

  ngAfterViewInit(): void {
    this.t_FicheTechniquesProduits.paginator = this.paginator;
    this.t_FicheTechniquesProduits.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.categorieProduitService.getListItems().subscribe((categories: CategorieProduit[]) => {
      this.categories = categories;
    });

    this.statutFicheTechniqueService.getListItems().subscribe((statutFicheTechniques: StatutFicheTechnique[]) => {
      this.statutFicheTechniques = statutFicheTechniques.filter(st => st.id < 7);
      this.statutFicheTechnique = statutFicheTechniques.find(st => st.id === 1);
    });

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

    this.produitService.getListItems().subscribe((produits: Produit[]) => {
      this.produits = produits.filter(f => f.categorieProduit === this.fixeCategorie);
    });

    if (this.ficheTechnique?.id) {
      this.ficheTechniquesService
        .getHistoriqueTraitementFicheTechnique(this.ficheTechnique.id)
        .subscribe((historiqueFicheTechniquesLoc: HistoriqueFicheTechnique[]) => {
          this.historiqueFicheTechniques = historiqueFicheTechniquesLoc;
        });
    } else {
      this.historiqueFicheTechniques = [];
    }
  }

  initFormCommandeClient_create() {
    this.form_ficheTechnique = this.formBuilder.group({
      id: [],
      client: [this.ficheTechnique?.client],
      commentaire: [],
      date_debut: [this.toDateOrNull(this.ficheTechnique?.date_debut)],
      duree: [this.ficheTechnique?.duree],
      date_fin: [{ value: this.toDateOrNull(this.ficheTechnique?.date_fin), disabled: true }],
    });

    this.setupAutoDateFin();
    this.updateDateFin();
  }

  initFormCommandeClient_update() {
    this.form_ficheTechnique = this.formBuilder.group({
      id: [],
      client: [this.ficheTechnique?.client],
      commentaire: [this.ficheTechnique?.commentaire],
      date_debut: [this.toDateOrNull(this.ficheTechnique?.date_debut)],
      duree: [this.ficheTechnique?.duree],
      date_fin: [{ value: this.toDateOrNull(this.ficheTechnique?.date_fin), disabled: true }],
    });

    this.setupAutoDateFin();
    this.updateDateFin();
  }

  initFormFicheTechniquesProduit_create() {
    this.form_ficheTechniquesProduit = this.formBuilder.group({
      id: [null],
      designation: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      produit: [null, Validators.required],
      prix_unitaire: [null],
    });
  }

  private resetProduitLineForm() {
    this.editingRowKey = null;

    this.form_ficheTechniquesProduit.reset({
      id: null,
      designation: '',
      quantite: 1,
      produit: null,
      prix_unitaire: null,
    });

    this.form_ficheTechniquesProduit.markAsPristine();
    this.form_ficheTechniquesProduit.markAsUntouched();
  }

  private hasPersistedId(
    item: Partial<FicheTechniqueProduit> | null | undefined
  ): item is Partial<FicheTechniqueProduit> & { id: number } {
    return item?.id !== null && item?.id !== undefined;
  }

  private buildRowKey(item?: Partial<FicheTechniqueProduit>): string {
    if (this.hasPersistedId(item)) {
      return `db-${item.id}`;
    }

    this.rowSeq += 1;
    return `tmp-${Date.now()}-${this.rowSeq}`;
  }

  private toRow(item: FicheTechniqueProduit): FicheTechniqueProduitRow {
    return {
      ...item,
      __rowKey: this.buildRowKey(item),
      __persisted: this.hasPersistedId(item),
    };
  }

  private stripRowMeta(row: FicheTechniqueProduitRow): FicheTechniqueProduit {
    const { __rowKey, __persisted, ...rest } = row;
    return rest as FicheTechniqueProduit;
  }

  private setupAutoDateFin() {
    const dateCtrl = this.form_ficheTechnique.get('date_debut');
    const dureeCtrl = this.form_ficheTechnique.get('duree');

    if (!dateCtrl || !dureeCtrl) return;

    combineLatest([
      dateCtrl.valueChanges.pipe(startWith(dateCtrl.value)),
      dureeCtrl.valueChanges.pipe(startWith(dureeCtrl.value)),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateDateFin());
  }

  updateDateFin() {
    const dateDebut = this.form_ficheTechnique.get('date_debut')?.value;
    const duree = this.form_ficheTechnique.get('duree')?.value;

    const dateFin = this.addMonthsSafe(dateDebut, duree);
    this.form_ficheTechnique.get('date_fin')?.setValue(dateFin, { emitEvent: false });
  }

  private addMonthsSafe(dateInput: any, monthsInput: any): Date | null {
    const d = this.toDateOrNull(dateInput);
    const m = Number(monthsInput);

    if (!d || !Number.isFinite(m)) return null;

    const day = d.getDate();

    const res = new Date(d);
    res.setDate(1);
    res.setMonth(res.getMonth() + m);

    const lastDay = new Date(res.getFullYear(), res.getMonth() + 1, 0).getDate();
    res.setDate(Math.min(day, lastDay));

    return res;
  }

  private toDateOrNull(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;

    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private formatDateYYYYMMDD(input: any): string {
    if (!input) return '';

    if (typeof input === 'string') {
      return input.length >= 10 ? input.substring(0, 10) : input;
    }

    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return '';

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
  }

  onGetClient(item: Client) {
    this.client = item;
  }

  onGetTotalLigne() {
    const formValue = this.form_ficheTechniquesProduit.value;

    if (formValue['quantite'] && formValue['prix_unitaire']) {
      const total = Number(formValue['quantite']) * Number(formValue['prix_unitaire']);
      this.form_ficheTechniquesProduit.get('total')?.setValue(total);
    }
  }

  onAdd() {
    if (this.form_ficheTechniquesProduit.invalid) {
      this.form_ficheTechniquesProduit.markAllAsTouched();
      return;
    }

    const formValue = this.form_ficheTechniquesProduit.getRawValue();

    const ficheTechniquesProduit: FicheTechniqueProduit = {
      id: formValue['id'] ?? undefined,
      designation: formValue['designation'],
      quantite: Number(formValue['quantite'] ?? 1),
      produit: formValue['produit'],
      prix_unitaire: formValue['prix_unitaire'] ?? undefined,
    } as FicheTechniqueProduit;

    if (this.editingRowKey) {
      this.update_ligneCommande(ficheTechniquesProduit);
    } else {
      this.add_ligneCommande(ficheTechniquesProduit);
    }
  }

  add_ligneCommande(ficheTechniquesProduit: FicheTechniqueProduit) {
    const row = this.toRow(ficheTechniquesProduit);

    this.t_FicheTechniquesProduits.data = [
      ...this.t_FicheTechniquesProduits.data,
      row
    ];

    this.resetProduitLineForm();
    this.getMontantTotal(this.t_FicheTechniquesProduits.data);
  }

  update_ligneCommande(ficheTechniquesProduit: FicheTechniqueProduit) {
    const rows = [...this.t_FicheTechniquesProduits.data];
    const index = rows.findIndex(r => r.__rowKey === this.editingRowKey);

    if (index < 0) {
      this.add_ligneCommande(ficheTechniquesProduit);
      return;
    }

    const current = rows[index];

    rows[index] = {
      ...current,
      ...ficheTechniquesProduit,
      __rowKey: current.__rowKey,
      __persisted: current.__persisted || this.hasPersistedId(ficheTechniquesProduit),
    };

    this.t_FicheTechniquesProduits.data = rows;
    this.resetProduitLineForm();
    this.getMontantTotal(this.t_FicheTechniquesProduits.data);
  }

  onUpdate(row: FicheTechniqueProduitRow) {
    this.editingRowKey = row.__rowKey;

    this.form_ficheTechniquesProduit.patchValue({
      id: row.id ?? null,
      designation: row.designation ?? '',
      quantite: row.quantite ?? 1,
      produit: row.produit ?? null,
      prix_unitaire: row.prix_unitaire ?? null,
    });

    this.form_ficheTechniquesProduit.markAsDirty();
  }

  onCancelLineEdit() {
    this.resetProduitLineForm();
  }

  onDelete(row: FicheTechniqueProduitRow) {
    this.dialogService.yes_no({
      title: 'Confirmation de la suppression',
      message: row.__persisted
        ? 'Cette ligne est déjà enregistrée. Confirmez-vous sa suppression ?'
        : 'Confirmez-vous supprimer cette ligne non encore enregistrée ?'
    }).subscribe(yes_no => {
      if (yes_no === true) {
        this.delete_ligneCommande(row);
      }
    });
  }

  delete_ligneCommande(row: FicheTechniqueProduitRow) {
    const rows = [...this.t_FicheTechniquesProduits.data];

    if (row.__persisted && row.id != null) {
      if (!this.deletedProduitIds.includes(row.id)) {
        this.deletedProduitIds.push(row.id);
      }

      this.t_FicheTechniquesProduits.data = rows.filter(p => p.id !== row.id);
    } else {
      this.t_FicheTechniquesProduits.data = rows.filter(p => p.__rowKey !== row.__rowKey);
    }

    if (this.editingRowKey === row.__rowKey) {
      this.resetProduitLineForm();
    }

    this.t_FicheTechniquesProduits._updateChangeSubscription();
    this.getMontantTotal(this.t_FicheTechniquesProduits.data);
  }

  getMontantTotal(ficheTechniquesProduits: FicheTechniqueProduit[]) {
    this.montant_de_la_commade = 0;

    if (ficheTechniquesProduits?.length > 0) {
      ficheTechniquesProduits.forEach((ficheTechniquesProduit: FicheTechniqueProduit) => {
        this.montant_de_la_commade +=
          Number(ficheTechniquesProduit.quantite ?? 0) *
          Number(ficheTechniquesProduit.prix_unitaire ?? 0);
      });
    }
  }

  onPrint() {
  }

  onSave() {
    const formValue = this.form_ficheTechnique.value;
    const produitsPayload = this.t_FicheTechniquesProduits.data.map(row => this.stripRowMeta(row));

    const dataFicheTechnique: FicheTechniques = {
      client: formValue['client'],
      direction: 1,
      utilisateur: 1,
      position: 1,
      commentaire: formValue['commentaire'],
      categorie_produit: this.fixeCategorie,
      produits_detail: produitsPayload,
    };

    const formData = new FormData();

    formData.append('client', String(dataFicheTechnique.client));
    formData.append('direction', String(dataFicheTechnique.direction));
    formData.append('utilisateur', String(dataFicheTechnique.utilisateur));
    formData.append('position', String(dataFicheTechnique.position));
    formData.append('commentaire', String(dataFicheTechnique.commentaire ?? ''));
    formData.append('categorie_produit', String(dataFicheTechnique.categorie_produit));
    formData.append('objet', String(this.getCategorieProduit(dataFicheTechnique.categorie_produit) ?? ''));

    const dDebut = this.form_ficheTechnique.get('date_debut')?.value;
    const dFin = this.form_ficheTechnique.get('date_fin')?.value;

    formData.append('date_debut', this.formatDateYYYYMMDD(dDebut));
    formData.append('duree', String(this.form_ficheTechnique.get('duree')?.value ?? ''));
    formData.append('date_fin', this.formatDateYYYYMMDD(dFin));

    formData.append('produits', JSON.stringify(produitsPayload));
    ///formData.append('produits_supprimes_ids', JSON.stringify(this.deletedProduitIds));

    const request$ =
      this.operation === operations.update
        ? this.ficheTechniquesService.update(this.ficheTechnique.id, formData)
        : this.ficheTechniquesService.create(formData);

    request$.subscribe(
      (data: FicheTechniques) => {
        this.msgMessageService.success('Fiche technique enregistrée avec succès');

        this.saveLocked = true;
        this.operation = this.operations.update;
        this.ficheTechnique = data;

        this.deletedProduitIds = [];
        this.editingRowKey = null;
        this.t_FicheTechniquesProduits.data =
          (data?.produits_detail ?? []).map(p => this.toRow(p));

        this.getMontantTotal(this.t_FicheTechniquesProduits.data);
      },
      (error) => {
        this.dialogService.alert({ message: error.message });
      }
    );
  }

  onRetour() {
    this.notifyActionOperation.emit(operations.table);
    this.ficheTechnique = undefined;
    this.notifyFicheTechnique.emit(this.ficheTechnique);
  }

  getProduit(id: number) {
    return this.produits.find(p => p.id === id)?.libelle;
  }

  getCategorieProduit(id: number) {
    return this.categories.find(p => p.id === id)?.libelle;
  }

  onTransmettre() {
    if (this.transmitLocked || this.isTransmitting) return;

    this.transmitLocked = true;
    this.isTransmitting = true;

    const miseAJourStatutFiche: MiseAJourStatutFiche = new MiseAJourStatutFiche();
    miseAJourStatutFiche.fiche_technique = this.ficheTechnique?.id;
    miseAJourStatutFiche.statut = 2;

    this.ficheTechniquesService.setStatutFiche(miseAJourStatutFiche)
      .pipe(
        finalize(() => {
          this.isTransmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.msgMessageService.success("Fiche transmise avec succès !");
        },
        error: (error) => {
          this.transmitLocked = false;
          this.dialogService.alert({
            message: error?.message ?? "Erreur lors de la transmission. Réessayez."
          });
        }
      });
  }
}
