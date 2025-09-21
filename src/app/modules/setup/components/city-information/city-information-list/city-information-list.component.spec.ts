import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityInformationListComponent } from './city-information-list.component';

describe('CityInformationListComponent', () => {
  let component: CityInformationListComponent;
  let fixture: ComponentFixture<CityInformationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityInformationListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CityInformationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
