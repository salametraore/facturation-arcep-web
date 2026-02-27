export interface LoginPayload {
  email: string;
  password: string;
}

export interface TwoFaPayload {
  email: string; // L'email est souvent requis pour l'étape 2FA
  code: string;
}

export interface LoginResponse {
  token?: string; // Le token JWT, facultatif
  requires2fa?: boolean;
  message?: string;
  detail?: string;
  user: User;
}

export interface User {
  id: number;

  email?: string;
  first_name?: string;
  last_name?: string;
  telephone?: string;

  // ✅ nouveaux champs renvoyés par l’API
  home?: 'BACKOFFICE' | 'PORTAIL_CLIENT';
  nature?: 'PERSONNEL' | 'CLIENT';

  client_id?: number | null;
  client?: { id: number; denomination_sociale?: string } | null;

  portail_role?: 'PORTAIL_CONSULTATION' | 'PORTAIL_PAIEMENT' | null;
  scopes?: string[];

  direction?: { id: number; libelle?: string } | null;

  // (optionnel) si ton backend renvoie encore roles/operations
  roles?: any[];
  operations?: any[];
}


export interface Direction{
  id: number;
  code:string ;
  libelle: string;
  typeDirection : string;

}
export interface TypeDirection{
    id: number;
  code:string ;
  libelle: string;

}





export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}
export interface PasswordResetPayload {
  email?: string;
}
export interface PasswordResetConfirmPayload {
  email?: string;
  password?: String;
  token?: string;
}
export interface VerifyResetCodePayload {
  email?: string;
  token?: string;
}
