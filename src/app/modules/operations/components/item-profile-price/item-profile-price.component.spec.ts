import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemProfilePriceComponent } from './item-profile-price.component';

describe('ItemProfilePriceComponent', () => {
  let component: ItemProfilePriceComponent;
  let fixture: ComponentFixture<ItemProfilePriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemProfilePriceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ItemProfilePriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
