import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivitesPostalesChiffresAffairesService } from "../../../shared/services/activites-postales-chiffres-affaires.services";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClientAutorisePostal } from "../../../shared/models/client";
import { ClientService } from "../../../shared/services/client.service";
import { ChiffreAffairePostaleCreateWithFileRequest } from "../../../shared/models/activites-postales-chiffres-affaires";
import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";

interface ChiffreAffairePostaleResponse {
  message: string;
  chiffre_affaire: any;          // tu peux typer plus finement
  total_lignes_importees: number;
}

@Component({
  selector: 'app-import-bilan-dialog',
  templateUrl: './import-bilan-dialog.component.html',
  styleUrls: ['./import-bilan-dialog.component.scss']
})
export class ImportBilanDialogComponent implements OnInit {

  file: File | null = null;
  anneeFiscale?: number;
  client = '';
  isSubmitting = false;

  form: FormGroup;
  selectedFile: File | null = null;

  // 👉 Doit être un tableau pour le *ngFor
  clients: ClientAutorisePostal[] = [];

  constructor(
    private dialogRef: MatDialogRef<ImportBilanDialogComponent>,
    private activitesPostalesService: ActivitesPostalesChiffresAffairesService,
    private clientService: ClientService,
    private fb: FormBuilder,
    private msgMessageService: MsgMessageServiceService,
  ) {
    this.form = this.fb.group({
      client: [null, Validators.required],
      annee_fiscale: [new Date().getFullYear(), Validators.required],
      date_chargement: [new Date(), Validators.required],
      nom: [''],
      fichier: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.clientService.getListeClientsAutorisesPostal()
      .subscribe((resp: any) => {

        console.log('Réponse getListeClientsAutorisesPostal =', resp);

        // Cas 1 : l’API renvoie directement un tableau
        if (Array.isArray(resp)) {
          this.clients = resp;

          // Cas 2 : { content: [...] } (Spring Data page)
        } else if (resp && Array.isArray(resp.content)) {
          this.clients = resp.content;

          // Cas 3 : { data: [...] }
        } else if (resp && Array.isArray(resp.data)) {
          this.clients = resp.data;

          // Cas 4 : { clients: [...] }
        } else if (resp && Array.isArray(resp.clients)) {
          this.clients = resp.clients;

          // Cas 5 : un seul objet => on le met dans un tableau
        } else if (resp && !Array.isArray(resp)) {
          console.warn('Réponse non tableau, on l’enveloppe dans un array :', resp);
          this.clients = [resp as ClientAutorisePostal];

        } else {
          console.error('Structure de réponse inattendue pour les clients :', resp);
          this.clients = [];
        }
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.file = input.files[0];
    }
  }

  onCancel(): void {
    this.dialogRef.close();
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
    formData.append('nom', payload.fichier.name);
    formData.append('fichier', payload.fichier, payload.fichier.name);

    console.log("formData");
    console.log(formData);

    this.activitesPostalesService.InitierChiffreAffaire(formData).subscribe({
      next: (resp) => {
        this.isSubmitting = false;

        // Afficher tout l’objet JSON retourné
        this.msgMessageService.success(
          `Importation réussie !
         Montant total : ${resp.chiffre_affaire.chiffre_affaire}
         Lignes importées : ${resp.total_lignes_importees}`
        );

        // Fermer le dialog en renvoyant la réponse brute
        this.dialogRef.close(resp);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.msgMessageService.failed("Erreur lors de l'import du chiffre d'affaires");
      }
    });
  }
}
