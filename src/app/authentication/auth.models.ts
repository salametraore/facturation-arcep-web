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
  email: string;
  telephone : string;
  role : string;
  direction : Direction ;
  last_name : string;
  first_name : string;
  // ... autres propriétés de l'utilisateur
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
