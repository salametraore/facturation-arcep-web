// client.resolver.ts
import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {ClientService} from "../../../shared/services/client.service";
import {Client} from "../../../shared/models/client";

@Injectable({ providedIn: 'root' })
export class ClientResolver implements Resolve<Client> {
  constructor(private clientService: ClientService) {}
  resolve(route: ActivatedRouteSnapshot) {
    const id = Number(route.paramMap.get('id'));
    return this.clientService.getItem(id);
  }
}
