import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityInformationComponent } from './city-information-form.component';

describe('CityInformationComponent', () => {
  let component: CityInformationComponent;
  let fixture: ComponentFixture<CityInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityInformationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CityInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
