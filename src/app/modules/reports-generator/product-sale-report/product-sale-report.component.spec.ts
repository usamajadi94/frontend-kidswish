import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSaleReportComponent } from './product-sale-report.component';

describe('ProductSaleReportComponent', () => {
  let component: ProductSaleReportComponent;
  let fixture: ComponentFixture<ProductSaleReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSaleReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductSaleReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
