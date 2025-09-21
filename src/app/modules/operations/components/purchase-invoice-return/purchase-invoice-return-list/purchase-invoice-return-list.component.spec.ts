import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceReturnListComponent } from './purchase-invoice-return-list.component';

describe('PurchaseInvoiceReturnListComponent', () => {
  let component: PurchaseInvoiceReturnListComponent;
  let fixture: ComponentFixture<PurchaseInvoiceReturnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseInvoiceReturnListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PurchaseInvoiceReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
