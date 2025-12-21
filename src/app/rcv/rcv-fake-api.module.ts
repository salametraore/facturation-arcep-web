import { APP_INITIALIZER, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { RcvSeedLoaderService } from './rcv-seed-loader.service';

/**
 * Charge le seed JSON une seule fois au démarrage (LocalStorage).
 * -> Permet à tes écrans CRUD (MatTable) de fonctionner sans backend.
 */
export function initRcvSeed(seed: RcvSeedLoaderService) {
  return () => seed.initFromAssetsOnce('/assets/mocks/rcv-mock-db.json');
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    RcvSeedLoaderService,
    {
      provide: APP_INITIALIZER,
      useFactory: initRcvSeed,
      deps: [RcvSeedLoaderService],
      multi: true
    }
  ]
})
export class RcvFakeApiModule {
  // Optionnel: éviter import multiple
  constructor(@Optional() @SkipSelf() parentModule: RcvFakeApiModule) {
    if (parentModule) {
      throw new Error('RcvFakeApiModule est déjà chargé. Importe-le une seule fois (AppModule ou CoreModule).');
    }
  }
}
