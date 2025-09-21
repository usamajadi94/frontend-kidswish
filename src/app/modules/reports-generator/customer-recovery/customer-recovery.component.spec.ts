import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRecoveryComponent } from './customer-recovery.component';

describe('CustomerRecoveryComponent', () => {
  let component: CustomerRecoveryComponent;
  let fixture: ComponentFixture<CustomerRecoveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerRecoveryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerRecoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
