import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { App } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations(),           // ✅ nécessaire pour Angular Material
    provideHttpClient(),           // ✅ utile pour les appels API
    importProvidersFrom()          // (laisse vide ici, mais permet d’ajouter des modules globaux si besoin)
  ]
}).catch(err => console.error(err));
