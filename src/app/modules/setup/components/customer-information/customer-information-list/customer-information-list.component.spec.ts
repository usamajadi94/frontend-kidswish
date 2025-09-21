import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerInformationListComponent } from './customer-information-list.component';

describe('CustomerInformationListComponent', () => {
  let component: CustomerInformationListComponent;
  let fixture: ComponentFixture<CustomerInformationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerInformationListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerInformationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
