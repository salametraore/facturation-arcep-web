import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { TypeDirection, TypeDirectionRequest } from '../../../shared/models/typeDirection';
import { TypeDirectionsService } from '../../../shared/services/type-directions.services';

import {MsgMessageServiceService} from "../../../shared/services/msg-message-service.service";

export interface TypeDirectionCrudData {
  id?: number; // ✅ si absent => création
}



@Component({
  selector: 'type-direction-crud',
  templateUrl: './type-direction-crud.component.html'
})
export class TypeDirectionCrudComponent implements OnInit {

  loading = false;
  saving = false;

  isNew = true;
  current?: TypeDirection;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: TypeDirectionsService,
    private ref: MatDialogRef<TypeDirectionCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TypeDirectionCrudData
  ) {}

  ngOnInit(): void {
    this.isNew = !this.data?.id;

    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(100)]],
      libelle: [null, [Validators.maxLength(500)]]
    });

    if (!this.isNew) {
      this.load();
    }
  }

  get f() { return this.form.controls; }

  load(): void {
    if (!this.data.id) return;
    this.loading = true;

    this.api.getItem(this.data.id).subscribe({
      next: (row) => {
        this.current = row;
        this.form.patchValue({
          code: row.code,
          libelle: row.libelle ?? null
        });
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  close(changed = false): void {
    this.ref.close(changed);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: TypeDirectionRequest = {
      code: this.f['code'].value,
      libelle: this.f['libelle'].value
    };

    this.saving = true;

    const obs$ = this.isNew
      ? this.api.create(payload)
      : this.api.update(this.data.id!, payload);

    obs$.subscribe({
      next: () => {
        this.saving = false;
        this.close(true);
      },
      error: () => (this.saving = false)
    });
  }
}
