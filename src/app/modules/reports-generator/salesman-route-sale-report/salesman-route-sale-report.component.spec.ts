import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesmanRouteSaleReportComponent } from './salesman-route-sale-report.component';

describe('SalesmanRouteSaleReportComponent', () => {
  let component: SalesmanRouteSaleReportComponent;
  let fixture: ComponentFixture<SalesmanRouteSaleReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesmanRouteSaleReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesmanRouteSaleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
