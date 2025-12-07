
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChiffreAffairePostaleCreateWithFileRequest } from '../../../shared/models/activites-postales-chiffres-affaires';
import { ActivitesPostalesChiffresAffairesService } from '../../../shared/services/activites-postales-chiffres-affaires.services';
import { Client } from '../../../shared/models/client';

import {ClientService} from "../../../shared/services/client.service";


@Component({
  selector: 'import-document-dialog',
  templateUrl: './import-document-dialog.component.html',
  styleUrl: './import-document-dialog.component.scss'
})
export class ImportDocumentDialogComponent {
  form: FormGroup;
  selectedFile: File | null = null;

  // si tu veux lister les clients dans un <mat-select>
  clients: Client[] = [];

  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ImportDocumentDialogComponent>,
    private clientService: ClientService,
    private activitesPostalesService: ActivitesPostalesChiffresAffairesService,
    @Inject(MAT_DIALOG_DATA) public data: any    // si tu veux passer qqch depuis le parent
  ) {
    this.form = this.fb.group({
      client: [null, Validators.required],
      annee_fiscale: [new Date().getFullYear(), Validators.required],
      date_chargement: [new Date(), Validators.required],
      nom: [''],
      fichier: [null, Validators.required],
      fiche_technique_id: 162,
      fiche_technique_autorisation_id:161,
    });

    // Si tu as déjà une liste de clients dans le service :
    // this.activitesService.getClients().subscribe(clients => this.clients = clients);
  }

  ngOnInit(): void {

    this.clientService.getItems().subscribe((clients: Client[]) => {
      this.clients = clients;
    });

  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      this.form.get('fichier')?.setValue(null);
      return;
    }
    this.selectedFile = input.files[0];
    this.form.get('fichier')?.setValue(this.selectedFile);
  }

  onCancel(): void {
    this.dialogRef.close();   // rien de spécial
  }


  onSubmit(): void {

    console.log("debut sauvegarde");
    console.log(this.form.value);

    if (this.form.invalid || !this.selectedFile) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const value = this.form.value;

    console.log("construction payload");
    const payload: ChiffreAffairePostaleCreateWithFileRequest = {
      client: Number(value.client),
      annee_fiscale: Number(value.annee_fiscale),
      date_chargement: (value.date_chargement as Date).toISOString(),
      nom: value.nom as string,
      fichier: this.selectedFile as File
    };

    console.log(payload);

    console.log("construction formdata");
    const formData = new FormData();
    formData.append('client', String(payload.client));
    formData.append('annee_fiscale', String(payload.annee_fiscale));
    formData.append('date_chargement', payload.date_chargement);
    formData.append('nom', payload.nom);
    formData.append('fichier', payload.fichier, payload.fichier.name);

    console.log(formData);

    this.activitesPostalesService.InitierChiffreAffaire(formData).subscribe({
      next: (docCree) => {
        this.isSubmitting = false;
        // on renvoie une info de succès + le doc créé au parent
        this.dialogRef.close(docCree);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        // tu peux afficher un message d'erreur ici
      }
    });
  }
}
