import { Component, OnInit } from '@angular/core';
import { RcvSeedLoaderService } from './rcv/rcv-seed-loader.service';
import { AuthService } from './authentication/auth.service';
import { AuthzService } from './authentication/authz.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private seed: RcvSeedLoaderService,
    private authService: AuthService,
    private authzService: AuthzService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.seed.initFromAssetsOnce('/assets/mocks/rcv-mock-db.json');
    } catch (e) {
      console.error('Erreur lors du chargement du seed RCV', e);
    }

    if (this.authService.isAuthenticated()) {
      this.authzService.refreshAccess().subscribe({
        error: () => {
          this.authService.logout();
          this.authzService.clear();
        }
      });
    } else {
      this.authzService.clear();
    }
  }
}
