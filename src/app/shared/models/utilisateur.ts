
import { RoleEnum } from './roleEnum';


export class Utilisateur {
  readonly id: number;
  username: string;
  last_name?: string;
  first_name?: string;
  telephone?: string | null;
  email?: string;
  role?: RoleEnum;
  direction?: number | null;
  password: string;
}



