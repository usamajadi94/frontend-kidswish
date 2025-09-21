import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemProfileMultiPricingComponent } from './item-profile-multi-pricing.component';

describe('ItemProfileMultiPricingComponent', () => {
  let component: ItemProfileMultiPricingComponent;
  let fixture: ComponentFixture<ItemProfileMultiPricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemProfileMultiPricingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ItemProfileMultiPricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
