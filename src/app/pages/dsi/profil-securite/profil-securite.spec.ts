import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilSecurite } from './profil-securite';

describe('ProfilSecurite', () => {
  let component: ProfilSecurite;
  let fixture: ComponentFixture<ProfilSecurite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilSecurite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilSecurite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
