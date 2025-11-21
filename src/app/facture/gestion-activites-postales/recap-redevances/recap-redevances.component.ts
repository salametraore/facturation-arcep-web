import { Component, OnInit } from '@angular/core';
import {
  ClientInfos,
  CompteBilanLigne,
  DocumentUtilise,
  LigneRetenue, RedevanceLigne,
} from '../../../shared/models/activites-postales';
import { ActivatedRoute, Router } from "@angular/router";
import { ActivitesPostalesService } from "../../../shared/services/activites-postales.service";
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder
} from "@angular/forms";


type RecapFG = FormGroup<{
  redevances: FormArray<RedevanceFG>;
}>;


// type de FormGroup pour la saisie
type RedevanceFG = FormGroup<{
  code: FormControl<string>;
  nature: FormControl<string>;
  taux: FormControl<number>;
  montantDu: FormControl<number>;
}>;


@Component({
  selector: 'app-recap-redevances',
  templateUrl: './recap-redevances.component.html',
  styleUrls: ['./recap-redevances.component.scss']   // ✅ styleUrls
})
export class RecapRedevancesComponent implements OnInit {

  form!: RecapFG;

  // Infos pour la partie gauche
  entreprise!: ClientInfos;
  document!: DocumentUtilise;
  lignesRetenues: LigneRetenue[] = [];

  displayedLignesColumns = ['numero', 'libelle', 'montantRetenu'];

  constructor(
    private fb: NonNullableFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private workflow: ActivitesPostalesService
  ) {
    // init du form
    this.form = this.fb.group({
      redevances: this.fb.array<RedevanceFG>([])
    });
  }

  private toRedevanceFG(r: RedevanceLigne): RedevanceFG {
    const fg = this.fb.group({
      code: [r.code],
      nature: [r.nature],
      taux: [r.taux],
      montantDu: [0]
    });

    // Quand le taux change → recalcul
    fg.controls.taux.valueChanges.subscribe(() => this.recalculerMontants());

    return fg;
  }

  get docId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  get redevancesFA(): FormArray<RedevanceFG> {
    return this.form.controls.redevances;
  }

  ngOnInit(): void {
    const doc = this.workflow.getDocument(this.docId);
    const lignesBilan: CompteBilanLigne[] =
      this.workflow.getComptesBilan(this.docId) || [];

    if (!doc) {
      // au pire, on revient à la liste
      this.router.navigate(['/facture/activites-postales']);
      return;
    }

    // ====== 1) Infos entreprise / document ======
    this.entreprise = {
      ClientId: doc.ClientId,
      ClientNom: doc.ClientNom,
      anneeFiscale: doc.anneeFiscale,
      typeOperateur: 'Activités postales',   // cohérent avec ClientInfos
    };

    this.document = {
      id: doc.id,
      type: 'Balance',
      nomFichier: doc.nomFichier,
      coche: true
    };

    // ====== 2) Lignes retenues = comptes bilan sélectionnés ======
    this.lignesRetenues = (lignesBilan || [])
      .filter(l => l.selectionne)
      .map<LigneRetenue>(l => ({
        numero: l.numero,
        libelle: l.libelle,
        montantRetenu: l.montantEstime ?? l.montant
      }));

    // Si vraiment aucune ligne (dev / tests), on peut au besoin injecter un mock
    // (facultatif – tu peux commenter si inutile)
    if (!this.lignesRetenues.length) {
      console.warn('Aucune ligne retenue, vérifie le flux précédent (bilan).');
    }

    // ====== 3) Initialiser les redevances (mock ou valeurs par défaut) ======

    this.workflow.getRedevancesInit()
      .forEach(r => this.redevancesFA.push(this.toRedevanceFG(r)));

    this.recalculerMontants();
  }




  // ========== Base de calcul ==========

  get totalMontantRetenu(): number {
    return this.lignesRetenues.reduce(
      (sum, l) => sum + (l.montantRetenu || 0),
      0
    );
  }

  // ========== Calcul des montants dus ==========

  private recalculeLigne(fg: RedevanceFG): void {
    const taux = fg.controls.taux.value || 0;
    const base = this.totalMontantRetenu; // 👈 base taxable = total montants estimés
    const montant = base * (taux / 100);
    fg.controls.montantDu.setValue(montant, { emitEvent: false });
  }

  private recalculerMontants(): void {
    this.redevancesFA.controls.forEach(fg => this.recalculeLigne(fg));
  }

  get totalMontantDu(): number {
    return this.redevancesFA.controls.reduce(
      (sum, fg) => sum + (fg.controls.montantDu.value || 0),
      0
    );
  }

  // ========== Actions / navigation ==========

  onTelechargerTableau(): void {
    // TODO: appeler le backend pour générer un Excel / PDF
    console.log('Télécharger le tableau de ventilation des redevances');
  }

  onTransmettre(): void {
    const base = this.totalMontantRetenu;

    const redevances: RedevanceLigne[] = this.redevancesFA.controls.map(fg => ({
      code: fg.controls.code.value || '',
      nature: fg.controls.nature.value || '',
      baseTaxable: base,                              // 👈 ici
      taux: fg.controls.taux.value || 0,
      montantDu: fg.controls.montantDu.value || 0
    }));

    const payload = {
      docId: this.docId,
      entreprise: this.entreprise,
      document: this.document,
      lignesRetenues: this.lignesRetenues,
      redevances
    };

    console.log('Payload à transmettre : ', payload);

    // TODO: this.workflow.transmettreRedevances(this.docId, payload).subscribe(...)
    this.router.navigate(['/facture/activites-postales']);
  }

  goPrev(): void {
    this.router.navigate([
      '/facture/activites-postales',
      this.docId,
      'traitement'
    ]);
  }
}
