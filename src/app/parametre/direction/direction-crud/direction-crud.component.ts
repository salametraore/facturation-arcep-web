import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Direction, DirectionRequest } from '../../../shared/models/direction';
import { DirectionService } from '../../../shared/services/direction.service';

import { TypeDirection } from '../../../shared/models/typeDirection';
import { TypeDirectionsService } from '../../../shared/services/type-directions.services';
import {DirectionsService} from "../../../shared/services/directions.services";

export interface DirectionCrudData {
  id?: number; // ✅ absent => création
}


@Component({
  selector: 'type-direction-crud',
  templateUrl: './direction-crud.component.html'
})
export class DirectionCrudComponent implements OnInit {

  loading = false;
  saving = false;

  isNew = true;
  current?: Direction;

  form!: FormGroup;

  typeDirections: TypeDirection[] = [];

  constructor(
    private fb: FormBuilder,
    private api: DirectionsService,
    private typeApi: TypeDirectionsService,
    private ref: MatDialogRef<DirectionCrudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DirectionCrudData
  ) {}

  ngOnInit(): void {
    this.isNew = !this.data?.id;

    this.form = this.fb.group({
      libelle: ['', [Validators.required, Validators.maxLength(200)]],
      type_direction: [null, Validators.required]
    });

    this.loadTypeDirections();

    if (!this.isNew) {
      this.load();
    }
  }

  get f() { return this.form.controls; }

  loadTypeDirections(): void {
    this.typeApi.getItems().subscribe({
      next: (rows) => (this.typeDirections = rows ?? []),
      error: () => (this.typeDirections = [])
    });
  }

  load(): void {
    if (!this.data.id) return;

    this.loading = true;
    this.api.getItem(this.data.id).subscribe({
      next: (row) => {
        this.current = row;
        this.form.patchValue({
          libelle: row.libelle,
          type_direction: row.type_direction
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

    const payload: DirectionRequest = {
      libelle: this.f['libelle'].value,
      type_direction: this.f['type_direction'].value
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
