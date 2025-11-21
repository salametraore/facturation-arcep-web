import { Component, OnInit } from '@angular/core';
import {
  ClientInfos,
  CompteBilanLigne,
  DocumentComptableImporte,
  DocumentUtilise,
  LigneRetenue,
  RedevanceLigne,
  CompteImport,
  StatutImport,
} from '../../../shared/models/activites-postales';
import { ActivatedRoute, Router } from "@angular/router";
import {ActivitesPostalesService, MOCK_REDEVANCES_INIT} from "../../../shared/services/activites-postales.service";
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder
} from "@angular/forms";

// type de FormGroup pour une ligne
type LigneFG = FormGroup<{
  selectionne: FormControl<boolean>;
  numero: FormControl<string>;
  libelle: FormControl<string>;
  montant: FormControl<number>;
  montantEstime: FormControl<number | null>;
}>;

// type pour le formulaire global
type BilanFG = FormGroup<{
  exercice: FormControl<number | null>;
  clientId: FormControl<number | null>;
  lignes: FormArray<LigneFG>;
}>;


@Component({
  selector: 'app-traitement-bilan',
  templateUrl: './traitement-bilan.component.html',
  styleUrls: ['./traitement-bilan.component.scss']  // ✅ styleUrls
})
export class TraitementBilanComponent implements OnInit {

  form!: BilanFG;

  displayedColumns: string[] = [
    'selectionne',
    'numero',
    'libelle',
    'montant',
    'montantEstime'
  ];

  docNom = '';
  docEntreprise = '';
  docAnnee = 0;




  constructor(
    private fb: NonNullableFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workflow: ActivitesPostalesService
  ) {
    // init formulaire
    this.form = this.fb.group({
      exercice: [null],
      clientId: [null],
      lignes: this.fb.array<LigneFG>([])
    });
  }

  get docId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  get lignesFA(): FormArray<LigneFG> {
    return this.form.controls.lignes;
  }

  ngOnInit(): void {
    // ====== 1) Infos document ======
    const doc = this.workflow.getDocument(this.docId);
    if (doc) {
      this.docNom = doc.nomFichier;
      this.docEntreprise = doc.ClientNom;
      this.docAnnee = doc.anneeFiscale;

      this.form.patchValue(
        {
          exercice: doc.anneeFiscale,
          clientId: doc.ClientId
        },
        { emitEvent: false }
      );
    }

    // 2) On récupère d’abord les comptes bilan (service gère mémoire + mocks)
    let source: CompteBilanLigne[] = this.workflow.getComptesBilan(this.docId);

// 3) Si vraiment rien, on reconstruit à partir des comptes import
    if (!source.length) {
      const comptesImport = this.workflow.getComptesImport(this.docId) || [];

      source = comptesImport
        .filter(c => c.selectionne)
        .map<CompteBilanLigne>(c => ({
          numero: c.numero,
          libelle: c.libelle,
          montant: (c.credit || 0) - (c.debit || 0),
          montantEstime: null,
          selectionne: true
        }));
    }


    // ====== 5) On injecte dans le FormArray ======
    source.forEach(l => this.lignesFA.push(this.toLigneFG(l)));
  }

  private toLigneFG(l: CompteBilanLigne): LigneFG {
    const fg = this.fb.group({
      selectionne: [l.selectionne],
      numero: [l.numero],
      libelle: [l.libelle],
      montant: [l.montant],
      montantEstime: [{ value: l.montantEstime ?? null, disabled: !l.selectionne }]
    });

    fg.controls.selectionne.valueChanges.subscribe(selected => {
      const ctrl = fg.controls.montantEstime;
      if (!selected) {
        ctrl.disable({ emitEvent: false });
        ctrl.setValue(null, { emitEvent: false });
      } else {
        ctrl.enable({ emitEvent: false });
      }
    });

    return fg;
  }

  get totalMontant(): number {
    return this.lignesFA.controls.reduce(
      (sum, fg) => sum + (fg.controls.montant.value || 0),
      0
    );
  }

  get totalMontantEstime(): number {
    return this.lignesFA.controls.reduce((sum, fg) => {
      const ctrl = fg.controls.montantEstime;
      if (ctrl.disabled) {
        return sum;
      }
      return sum + (ctrl.value ?? 0);
    }, 0);
  }

  get allSelected(): boolean {
    return (
      this.lignesFA.length > 0 &&
      this.lignesFA.controls.every(fg => fg.controls.selectionne.value)
    );
  }

  toggleAllSelection(): void {
    const target = !this.allSelected;
    this.lignesFA.controls.forEach(fg =>
      fg.controls.selectionne.setValue(target)
    );
  }

  goPrev(): void {
    this.router.navigate([
      '/facture/activites-postales',
      this.docId,
      'comptes'
    ]);
  }

  goNext(): void {
    const lignes = this.lignesFA.getRawValue() as CompteBilanLigne[];
    this.workflow.setComptesBilan(this.docId, lignes);

    this.router.navigate([
      '/facture/activites-postales',
      this.docId,
      'recap'
    ]);
  }
}
