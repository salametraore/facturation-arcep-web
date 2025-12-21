import {Component} from '@angular/core';
import {RcvSeedLoaderService} from "./rcv/rcv-seed-loader.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private seed: RcvSeedLoaderService) {
  }

  async ngOnInit() {
    await this.seed.initFromAssetsOnce('/assets/mocks/rcv-mock-db.json');
  }


}
