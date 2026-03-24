import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
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
import { finalize } from "rxjs/operators";

interface FicheTechniqueProduitRow extends FicheTechniqueProduit {
  __rowKey: string;
  __persisted: boolean;
}

@Component({
  selector: 'agrement-equipement-crud',
  templateUrl: './agrement-equipement-crud.component.html'
})
export class AgrementEquipementCrudComponent implements OnInit, AfterViewInit {

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

  saveLocked = false;

  public operations = operations;
  public bouton_names = bouton_names;
  public data_operation: string = '';

  displayedColumns: string[] = ['produit', 'marque', 'modele', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  montant_de_la_commade: number = 0;
  produits: Produit[] = [];
  productAllowedIds = [73, 74];
  historiqueFicheTechniques: HistoriqueFicheTechnique[] = [];

  private readonly PRODUCT_RADIO_ID = 73;
  private readonly PRODUCT_TERMINAL_ID = 74;

  private isRadio = (id: number) => id === this.PRODUCT_RADIO_ID;
  private isTerminal = (id: number) => id === this.PRODUCT_TERMINAL_ID;

  transmitLocked = false;
  isTransmitting = false;

  deletedProduitIds: number[] = [];
  editingRowKey: string | null = null;
  private rowSeq = 0;

  private hasProductInTable = (productId: number): boolean =>
    this.t_FicheTechniquesProduits.data?.some(r => r.produit === productId) ?? false;

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

  ngAfterViewInit(): void {
    this.t_FicheTechniquesProduits.paginator = this.paginator;
    this.t_FicheTechniquesProduits.sort = this.sort;
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

    console.log(this.ficheTechnique);
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
      this.produits = produits.filter(p =>
        p.categorieProduit === this.fixeCategorie &&
        this.productAllowedIds.includes(p.id)
      );

      if (this.ficheTechnique?.produits_detail?.length) {
        const firstProduit = this.ficheTechnique.produits_detail[0]?.produit;
        if (firstProduit != null) {
          this.form_ficheTechniquesProduit.patchValue({ produit: firstProduit });
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

  initFormCommandeClient_create() {
    this.form_ficheTechnique = this.formBuilder.group({
      id: [],
      client: [this.ficheTechnique?.client ?? null, Validators.required],
      commentaire: [this.ficheTechnique?.commentaire ?? ''],
    });
  }

  initFormCommandeClient_update() {
    this.form_ficheTechnique = this.formBuilder.group({
      id: [this.ficheTechnique?.id ?? null],
      client: [this.ficheTechnique?.client ?? null, Validators.required],
      commentaire: [this.ficheTechnique?.commentaire ?? ''],
    });
  }

  onGetClient(item: Client) {
    this.client = item;
  }

  initFormFicheTechniquesProduit_create() {
    this.form_ficheTechniquesProduit = this.formBuilder.group({
      id: [null],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      produit: [null, Validators.required],
    });
  }

  private resetProduitLineForm() {
    this.editingRowKey = null;

    this.form_ficheTechniquesProduit.reset({
      id: null,
      marque: '',
      modele: '',
      quantite: 1,
      produit: null,
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

  private getBaseRowTemplate(): FicheTechniqueProduit {
    const r = new FicheTechniqueProduit();
    r.marque = this.form_ficheTechniquesProduit.get('marque')?.value || '';
    r.modele = this.form_ficheTechniquesProduit.get('modele')?.value || '';
    r.quantite = 1;
    return r;
  }

  onAdd() {
    if (this.form_ficheTechniquesProduit.invalid) {
      this.form_ficheTechniquesProduit.markAllAsTouched();
      return;
    }

    const formValue = this.form_ficheTechniquesProduit.getRawValue();
    const selectedProductId = Number(formValue['produit']);

    if (!selectedProductId) {
      return;
    }

    const currentMarque = String(formValue['marque'] ?? '').trim();
    const currentModele = String(formValue['modele'] ?? '').trim();

    const alreadyExists = this.t_FicheTechniquesProduits.data.some(r =>
      r.produit === selectedProductId &&
      (r.marque ?? '').trim() === currentMarque &&
      (r.modele ?? '').trim() === currentModele &&
      r.__rowKey !== this.editingRowKey
    );

    if (alreadyExists) {
      this.msgMessageService.failed('Cet élément existe déjà dans la liste.');
      return;
    }

    const ficheTechniquesProduit: FicheTechniqueProduit = {
      id: formValue['id'] ?? undefined,
      marque: currentMarque,
      modele: currentModele,
      quantite: Number(formValue['quantite'] ?? 1),
      produit: selectedProductId,
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
      marque: row.marque ?? '',
      modele: row.modele ?? '',
      quantite: row.quantite ?? 1,
      produit: row.produit ?? null,
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
    }).subscribe(yes => {
      if (yes) {
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

  getProduitsLibelles(fiche: FicheTechniques | null | undefined): string {
    if (!fiche || !fiche.produits_detail || fiche.produits_detail.length === 0) {
      return '';
    }

    return fiche.produits_detail
      .map(p => this.getProduit(p.produit))
      .filter((lib): lib is string => !!lib && lib.trim().length > 0)
      .join(', ');
  }
}
