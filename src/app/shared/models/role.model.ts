import { Operation, OperationLite } from './operation.model';

export interface Role {
  id: number;
  code?: string;      // maxLength: 20
  libelle: string;    // maxLength: 200

  /** d’après ton JSON: tableau d’Operation COMPLET (avec fonctionnalite) */
  operations: Operation[];

  /** d’après ton JSON: tableau “lite” (id, code, libelle) */
  operations_detail?: OperationLite[];
}

export interface RoleRequest {
  code?: string;          // maxLength: 20
  libelle: string;        // maxLength: 200
  liste_operations: number[]; // writeOnly
}

export function roleToRequest(r: Role): RoleRequest {
  return {
    code: r.code,
    libelle: r.libelle,
    liste_operations: (r.operations ?? []).map(op => op.id),
  };
}
