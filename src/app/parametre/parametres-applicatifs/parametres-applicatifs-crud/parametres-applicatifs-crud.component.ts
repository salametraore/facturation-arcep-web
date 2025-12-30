import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Parametre, ParametreRequest, toParametreRequest } from '../../../shared/models/parametres';
import { ParametreService } from '../../../shared/services/parametres.services';

export interface ParametresCrudData {
  id: number;
}

@Component({
  selector: 'app-categorie-produit-crud',
  templateUrl: './parametres-applicatifs-crud.component.html'
})
export class ParametresApplicatifsCrudComponent implements OnInit {

  loading = false;
  saving = false;

  parametre?: Parametre;

  form!: FormGroup;

  isNew = true;

  constructor(
    private fb: FormBuilder,
    private api: ParametreService,
    private ref: MatDialogRef<ParametresApplicatifsCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ParametresCrudData
  ) {}


  get f() { return this.form.controls; }


  close(changed = false): void {
    this.ref.close(changed);
  }


  patchActive(): void {
    if (!this.parametre) return;
    const is_active = !!this.f['is_active'].value;

    this.saving = true;
    this.api.patch(this.parametre.id, { is_active }).subscribe({
      next: () => {
        this.saving = false;
        this.close(true);
      },
      error: () => (this.saving = false)
    });
  }


  ngOnInit(): void {
    this.isNew = !this.data?.id;

    this.form = this.fb.group({
      key: [{ value: '', disabled: !this.isNew }, [Validators.required, Validators.maxLength(200)]],
      value: [null],
      description: [null],
      is_active: [true, Validators.required]
    });

    if (!this.isNew) {
      this.load();
    }
  }

  load(): void {
    if (!this.data.id) return;

    this.loading = true;
    this.api.getItem(this.data.id).subscribe({
      next: (p) => {
        this.parametre = p;
        this.form.patchValue({
          key: p.key,
          value: p.value ?? null,
          description: p.description ?? null,
          is_active: !!p.is_active
        });
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  save(): void {
    const raw = this.form.getRawValue();

    const payload: ParametreRequest = {
      key: raw.key,
      value: raw.value,
      description: raw.description,
      is_active: raw.is_active
    };

    this.saving = true;

    const obs$ = this.isNew
      ? this.api.create(payload)                       // ✅ CREATE
      : this.api.update(this.data.id!, payload);       // ✅ UPDATE

    obs$.subscribe({
      next: () => {
        this.saving = false;
        this.close(true);
      },
      error: () => (this.saving = false)
    });
  }
}
