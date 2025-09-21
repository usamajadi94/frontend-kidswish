import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillCollectionComponent } from './bill-collection-form.component';

describe('BillCollectionComponent', () => {
  let component: BillCollectionComponent;
  let fixture: ComponentFixture<BillCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillCollectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BillCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
