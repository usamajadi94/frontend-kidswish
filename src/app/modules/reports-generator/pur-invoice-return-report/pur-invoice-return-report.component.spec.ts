import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurInvoiceReturnReportComponent } from './pur-invoice-return-report.component';

describe('PurInvoiceReturnReportComponent', () => {
  let component: PurInvoiceReturnReportComponent;
  let fixture: ComponentFixture<PurInvoiceReturnReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurInvoiceReturnReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PurInvoiceReturnReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
