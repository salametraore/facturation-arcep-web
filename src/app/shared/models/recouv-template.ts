// src/app/shared/models/recouv-template.ts

export type CanalEnum = 'EMAIL' | 'SMS' | 'COURRIER';

export class RecouvTemplate {
  readonly id!: number;          // readOnly

  created_at?: string;           // ISO date-time
  updated_at?: string;           // ISO date-time

  code!: string;                 // maxLength: 50
  canal!: CanalEnum;             // required

  nom!: string;                  // maxLength: 255
  sujet?: string | null;         // nullable, maxLength: 255

  contenu!: string;              // required

  variables?: any | null;        // JSON nullable (objet libre)

  actif?: boolean;

  created_by?: number | null;
  updated_by?: number | null;
}

/**
 * Payload POST/PUT/PATCH selon ton swagger:
 * on retire l'id (readOnly).
 * (Si ton backend traite created_at/updated_at comme readOnly, tu peux aussi les retirer.)
 */
export type RecouvTemplateRequest = Omit<RecouvTemplate, 'id'>;

export function toRecouvTemplateRequest(x: RecouvTemplate): RecouvTemplateRequest {
  const { id, ...payload } = x as any;
  return payload as RecouvTemplateRequest;
}
