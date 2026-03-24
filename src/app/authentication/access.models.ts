//src/app/authentication/access.models.ts

import {Operation, OperationRequest} from "../shared/models/operation.model";
export interface AccessUser {
  id: number;
  username?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface AccessRoleScope {
  code: string;
  direction_id?: number | null;
  produit_id?: number | null;
  is_global?: boolean;
}


export interface AccessPayload {
  user: AccessUser;
  roles: AccessRoleScope[];
  operations: OperationRequest[];
}

export interface ScopedResource {
  direction_id?: number | null;
  produit_id?: number | null;
  [key: string]: any;
}

export interface AllowedActionsMap {
  [action: string]: boolean;
}
