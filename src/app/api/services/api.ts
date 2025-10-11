export * from './api.service';
import { ApiService } from './api.service';
export * from './facturationApi.service';
import { FacturationApiService } from './facturationApi.service';
export const APIS = [ApiService, FacturationApiService];
