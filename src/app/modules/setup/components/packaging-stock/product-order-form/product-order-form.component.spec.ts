import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductOrderFormComponent } from './product-order-form.component';

describe('ProductOrderFormComponent', () => {
  let component: ProductOrderFormComponent;
  let fixture: ComponentFixture<ProductOrderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductOrderFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductOrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
