import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceReturnComponent } from './purchase-invoice-return.component';

describe('PurchaseInvoiceReturnComponent', () => {
  let component: PurchaseInvoiceReturnComponent;
  let fixture: ComponentFixture<PurchaseInvoiceReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseInvoiceReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PurchaseInvoiceReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
