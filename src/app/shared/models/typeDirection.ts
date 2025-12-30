export class TypeDirection {
  readonly id!: number;   // readOnly

  code!: string;          // maxLength: 100
  libelle?: string | null; // maxLength: 500 (nullable selon backend)
}

export type TypeDirectionRequest = Omit<TypeDirection, 'id'>;

export function toTypeDirectionRequest(td: TypeDirection): TypeDirectionRequest {
  const { id, ...payload } = td as any;
  return payload as TypeDirectionRequest;
}
