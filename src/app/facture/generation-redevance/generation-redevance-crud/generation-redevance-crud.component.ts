import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CategorieProduit } from '../../../shared/models/categorie-produit';
import { Client } from '../../../shared/models/client';

import { CategorieProduitService } from '../../../shared/services/categorie-produit.service';
import { ClientService } from '../../../shared/services/client.service';
import { FactureService } from '../../../shared/services/facture.service';
import { MsgMessageServiceService } from '../../../shared/services/msg-message-service.service';
import { DialogService } from '../../../shared/services/dialog.service';

import { GenererRedevanceRequest } from '../../../shared/models/facture';

import { finalize, take } from 'rxjs/operators';

type GenRedevanceControls = {
  categorie: FormControl<number | null>;
  annee: FormControl<number>;
  client: FormControl<number | null>;
  signataire: FormControl<string | null>;
};


@Component({
  selector: 'generation-redevance-crud',
  templateUrl: './generation-redevance-crud.component.html'
})
export class GenerationRedevanceCrudComponent implements OnInit {

  categories: CategorieProduit[] = [];
  clients: Client[] = [];

  form = new FormGroup<GenRedevanceControls>({
    categorie: new FormControl<number | null>(null, { validators: [Validators.required] }),
    annee: new FormControl<number>(new Date().getFullYear(), {
      validators: [Validators.required, Validators.min(2000), Validators.max(2100)]
    }),
    client: new FormControl<number | null>(null),
    signataire: new FormControl<string | null>(null,{ validators: [Validators.required] }),
  });


  isLoading = false;
  generated = false;

  constructor(
    private fb: FormBuilder,
    private factureService: FactureService,
    private clientService: ClientService,
    private categorieProduitService: CategorieProduitService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<GenerationRedevanceCrudComponent>,
    private msgMessageService: MsgMessageServiceService,
    public dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) public data: { categories?: CategorieProduit[] }
  ) {}

  ngOnInit() {
    // Précharger les listes
    this.categorieProduitService.getListItems().pipe(take(1)).subscribe((cats) => this.categories = cats);
    this.clientService.getItems().pipe(take(1)).subscribe((cls) => this.clients = cls);

  }

  get f() { return this.form.controls; }

  canGenerate(): boolean {
    return this.form.valid && !this.isLoading && !this.generated;
  }

  genererRedevancesAnnuelles() {
    if (!this.canGenerate()) return;

    const payload: GenererRedevanceRequest = {
      annee: this.f.annee.value ?? undefined,
      categorie_produit: this.f.categorie.value ?? undefined,
      client: this.f.client.value ?? undefined,
      signataire: this.f.signataire.value ?? undefined,
    };

    this.isLoading = true;

    this.factureService.genererRedevancesAnnuelles(payload)
      .pipe(
        take(1),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (res) => {
          this.generated = true;
          this.form.disable({ emitEvent: false });

          const nb = res?.resultat ?? 0;
          const msg = `${res?.message} (${nb} redevance(s) générée(s))`;

          this.msgMessageService.success(msg);
          this.snack.open(msg, 'OK', { duration: 4000 });
        },
        error: (err) => {
          const msg = err?.error?.message || 'Échec de la génération. Réessayez.';
          this.dialogService.alert({ message: msg });
          this.snack.open(msg, 'Fermer', { duration: 4000 });
        }
      });
  }


  fermer() {
    this.dialogRef.close(true);
  }

}
