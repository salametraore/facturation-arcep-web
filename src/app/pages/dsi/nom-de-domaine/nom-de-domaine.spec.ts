import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NomDeDomaine } from './nom-de-domaine';

describe('NomDeDomaine', () => {
  let component: NomDeDomaine;
  let fixture: ComponentFixture<NomDeDomaine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NomDeDomaine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NomDeDomaine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
