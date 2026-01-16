// src/app/shared/models/operation.model.ts
import { Fonctionnalite } from './fonctionnalite.model';

export interface Operation {
  id: number;
  code?: string;      // maxLength: 200
  libelle: string;
  fonctionnalite: Fonctionnalite;
}

export interface OperationRequest {
  code?: string;      // maxLength: 200
  libelle: string;
 fonctionnalite_id?: number;
}

export type OperationLite = Pick<Operation, 'id' | 'code' | 'libelle'>;
