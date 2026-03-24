///src/app/authentication/auth.models.ts
export interface LoginPayload {
  email: string;
  password: string;
}

export interface TwoFaPayload {
  email: string;
  code: string;
}

export interface LoginResponse {
  access?: string;    // format JWT actuel
  refresh?: string;   // format JWT actuel
  token?: string;     // ancien format, conservé pour compatibilité
  detail?: string;    // message OTP envoyé / message backend
  user?: User;
}

export interface User {
  id: number;
  username?: string;

  email?: string;
  first_name?: string;
  last_name?: string;
  telephone?: string;

  home?: 'BACKOFFICE' | 'PORTAIL_CLIENT';
  nature?: 'PERSONNEL' | 'CLIENT';

  client_id?: number | null;
  client?: { id: number; denomination_sociale?: string } | null;

  portail_role?: 'PORTAIL_CONSULTATION' | 'PORTAIL_PAIEMENT' | null;
  scopes?: string[];

  direction?: { id: number; libelle?: string } | null;

  roles?: any[];
  operations?: any[];
}

export interface Direction {
  id: number;
  code: string;
  libelle: string;
  typeDirection: string;
}

export interface TypeDirection {
  id: number;
  code: string;
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
  password?: string;
  token?: string;
}

export interface VerifyResetCodePayload {
  email?: string;
  token?: string;
}
