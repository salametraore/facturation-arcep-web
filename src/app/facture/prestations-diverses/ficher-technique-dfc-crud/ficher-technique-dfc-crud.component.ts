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
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MsgMessageServiceService } from "../../../shared/services/msg-message-service.service";
import { DialogService } from "../../../shared/services/dialog.service";
import { MatTableDataSource } from "@angular/material/table";
import { CategorieProduit } from "../../../shared/models/categorie-produit";
import { Client } from "../../../shared/models/client";
import { FicheTechniquesService } from "../../../shared/services/fiche-techniques.service";
import { CategorieProduitService } from "../../../shared/services/categorie-produit.service";
import { ProduitService } from "../../../shared/services/produits.service";
import { ClientService } from "../../../shared/services/client.service";
import { StatutFicheTechniqueService } from "../../../shared/services/statut-fiche-technique.service";
import { operations, bouton_names } from "../../../constantes";
import { Produit } from "../../../shared/models/produit";
import { FicheTechniques, MiseAJourStatutFiche } from "../../../shared/models/ficheTechniques";
import { StatutFicheTechnique } from "../../../shared/models/statut-fiche-technique";
import { FicheTechniqueProduit } from "../../../shared/models/ficheTechniquesProduits";
import { HistoriqueFicheTechnique } from "../../../shared/models/historique-traitement-fiche-technique";
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface FTProduitFilter {
  q?: string;
  designation?: string;
  minPrice?: number;
  maxPrice?: number;
  minQty?: number;
}

interface FicheTechniqueProduitRow extends FicheTechniqueProduit {
  __rowKey: string;
  __persisted: boolean;
}

@Component({
  selector: 'ficher-technique-dfc-crud',
  templateUrl: './ficher-technique-dfc-crud.component.html'
})
export class FicherTechniqueDfcCrudComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() fixeCategorie: number;
  @Input() ficheTechnique: FicheTechniques;
  @Input() operation: string;

  @Output() notifyFicheTechnique: EventEmitter<FicheTechniques> = new EventEmitter<FicheTechniques>();
  @Output() notifyActionOperation: EventEmitter<string> = new EventEmitter<string>();

  clients: Client[] = [];
  client: Client;

  categories: CategorieProduit[] = [];
  categoriesFiltered: CategorieProduit[] = [];
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

  displayedColumns: string[] = ['designation', 'prix_unitaire', 'quantite', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  montant_de_la_commade: number = 0;
  produits: Produit[] = [];

  filterForm!: FormGroup;
  private filterValues: FTProduitFilter = {};

  saveLocked = false;
  transmitLocked = false;
  isTransmitting = false;

  deletedProduitIds: number[] = [];
  editingRowKey: string | null = null;
  private rowSeq = 0;

  private destroy$ = new Subject<void>();

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

    this.initFormCommandeClient_create();
    this.initFormFicheTechniquesProduit_create();
    this.loadData();

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
      this.categoriesFiltered = categories.filter(f => f.id === this.fixeCategorie);
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

      const produitInitial =
        this.ficheTechnique?.produits_detail?.[0]?.produit ?? this.form_ficheTechnique.get('produit')?.value ?? null;

      if (produitInitial != null) {
        this.form_ficheTechnique.patchValue({ produit: produitInitial });

        if (!this.form_ficheTechnique.get('objet')?.value) {
          const libelleProduit = this.getLibelleProduit(produitInitial);
          if (libelleProduit) {
            this.form_ficheTechnique.patchValue({ objet: libelleProduit });
          }
        }
      }
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

  get totalGeneral(): number {
    const data = this.t_FicheTechniquesProduits?.data ?? [];
    return data.reduce((sum: number, e: any) => sum + (Number(e?.total) || 0), 0);
  }

  initFormCommandeClient_create() {
    this.form_ficheTechnique = this.formBuilder.group({
      id: [],
      client: [this.ficheTechnique?.client ?? null],
      objet: [this.ficheTechnique?.objet ?? ''],
      periode: [this.ficheTechnique?.periode ?? ''],
      type: [''],
      numeroCompte: [''],
      commentaire: [this.ficheTechnique?.commentaire ?? ''],
      produit: [null, Validators.required],
    });
  }

  initFormCommandeClient_update() {
    this.form_ficheTechnique = this.formBuilder.group({
      id: [this.ficheTechnique?.id ?? null],
      client: [this.ficheTechnique?.client ?? null],
      objet: [this.ficheTechnique?.objet ?? ''],
      periode: [this.ficheTechnique?.periode ?? ''],
      type: [''],
      numeroCompte: [''],
      commentaire: [this.ficheTechnique?.commentaire ?? ''],
      produit: [this.ficheTechnique?.produits_detail?.[0]?.produit ?? null, Validators.required],
    });
  }

  initFormFicheTechniquesProduit_create() {
    this.form_ficheTechniquesProduit = this.formBuilder.group({
      id: [null],
      designation: ['', Validators.required],
      prix_unitaire: [null, [Validators.required, Validators.min(0)]],
      quantite: [1, [Validators.required, Validators.min(1)]],
      total: [{ value: null, disabled: true }],
    });
  }

  private resetProduitLineForm() {
    this.editingRowKey = null;

    this.form_ficheTechniquesProduit.reset({
      id: null,
      designation: '',
      prix_unitaire: null,
      quantite: 1,
      total: null,
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
      total: Number(item?.total ?? (Number(item?.quantite ?? 0) * Number(item?.prix_unitaire ?? 0))),
      __rowKey: this.buildRowKey(item),
      __persisted: this.hasPersistedId(item),
    };
  }

  private stripRowMeta(row: FicheTechniqueProduitRow): FicheTechniqueProduit {
    const { __rowKey, __persisted, ...rest } = row;
    return rest as FicheTechniqueProduit;
  }

  onGetClient(item: Client) {
    this.client = item;
    this.form_ficheTechnique.patchValue({
      numeroCompte: item?.compte_comptable ?? ''
    });
  }

  onGetTotalLigne() {
    const formValue = this.form_ficheTechniquesProduit.getRawValue();
    const prix = Number(formValue['prix_unitaire'] ?? 0);
    const qte = Number(formValue['quantite'] ?? 0);
    const total = prix * qte;

    this.form_ficheTechniquesProduit.get('total')?.setValue(
      Number.isFinite(total) ? total : 0,
      { emitEvent: false }
    );
  }

  onAdd() {
    if (this.form_ficheTechnique.get('produit')?.invalid) {
      this.form_ficheTechnique.get('produit')?.markAsTouched();
      return;
    }

    if (this.form_ficheTechniquesProduit.invalid) {
      this.form_ficheTechniquesProduit.markAllAsTouched();
      return;
    }

    const formValue = this.form_ficheTechniquesProduit.getRawValue();
    const produitId = this.form_ficheTechnique.get('produit')?.value;

    const ficheTechniquesProduit: FicheTechniqueProduit = {
      id: formValue['id'] ?? undefined,
      designation: formValue['designation'],
      quantite: Number(formValue['quantite'] ?? 1),
      prix_unitaire: Number(formValue['prix_unitaire'] ?? 0),
      total: Number(formValue['total'] ?? 0),
      produit: produitId,
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
    const total = Number(ficheTechniquesProduit.quantite ?? 0) * Number(ficheTechniquesProduit.prix_unitaire ?? 0);

    rows[index] = {
      ...current,
      ...ficheTechniquesProduit,
      total,
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
      prix_unitaire: row.prix_unitaire ?? null,
      quantite: row.quantite ?? 1,
      total: Number(row.total ?? (Number(row.quantite ?? 0) * Number(row.prix_unitaire ?? 0))),
    });

    if (row.produit != null) {
      this.form_ficheTechnique.patchValue({
        produit: row.produit
      });
    }

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

  getCategorieProduit(id: number) {
    return this.categories.find(p => p.id === id)?.libelle;
  }

  getLibelleProduit(id: number) {
    return this.produits.find(p => p.id === id)?.libelle;
  }

  onChangeProduit(produitId: number): void {
    const libelleProduit = this.produits.find(p => p.id === produitId)?.libelle;

    if (libelleProduit) {
      this.form_ficheTechnique.patchValue({
        objet: libelleProduit
      });
    }
  }

  onSave() {
    const formValue = this.form_ficheTechnique.value;
    const produitsPayload = this.t_FicheTechniquesProduits.data.map(row => this.stripRowMeta(row));

    const dataFicheTechnique: FicheTechniques = {
      client: formValue['client'],
      direction: 1,
      objet: formValue['objet'],
      utilisateur: 1,
      position: 1,
      commentaire: formValue['commentaire'],
      periode: formValue['periode'],
      categorie_produit: this.fixeCategorie,
      statut: this.statutFicheTechnique,
      produits: produitsPayload,
    };

    console.log(dataFicheTechnique);

    const formData = new FormData();

    formData.append('client', String(dataFicheTechnique.client));
    formData.append('objet', String(dataFicheTechnique.objet ?? ''));
    formData.append('direction', String(dataFicheTechnique.direction));
    formData.append('utilisateur', String(dataFicheTechnique.utilisateur));
    formData.append('position', String(dataFicheTechnique.position));
    formData.append('commentaire', String(dataFicheTechnique.commentaire ?? ''));
    formData.append('periode', String(dataFicheTechnique.periode ?? ''));
    formData.append('categorie_produit', String(dataFicheTechnique.categorie_produit));
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
          (data?.produits_detail ?? data?.produits ?? []).map((p: FicheTechniqueProduit) => this.toRow(p));

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
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.msgMessageService.success("Fiche transmise avec succès !");
        },
        error: (error) => {
          this.transmitLocked = false;
          this.dialogService.alert({ message: error?.message ?? 'Erreur lors de la transmission.' });
        }
      });
  }
}
