import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceDeConfiance } from './service-de-confiance';

describe('ServiceDeConfiance', () => {
  let component: ServiceDeConfiance;
  let fixture: ComponentFixture<ServiceDeConfiance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDeConfiance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceDeConfiance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
