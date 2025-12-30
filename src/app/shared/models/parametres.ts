// src/app/shared/models/parametre.ts

export class Parametre {
  readonly id!: number;

  key!: string;              // maxLength: 200
  value?: string | null;
  description?: string | null;
  is_active!: boolean;

  readonly created_at!: string; // ISO date-time
  readonly updated_at!: string; // ISO date-time
}

export type ParametreRequest = Omit<Parametre, 'id' | 'created_at' | 'updated_at'>;

export function toParametreRequest(p: Parametre): ParametreRequest {
  // on retire les champs readOnly
  const { id, created_at, updated_at, ...payload } = p as any;
  return payload as ParametreRequest;
}
