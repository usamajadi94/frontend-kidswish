import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillCollectionListComponent } from './bill-collection-list.component';

describe('BillCollectionListComponent', () => {
  let component: BillCollectionListComponent;
  let fixture: ComponentFixture<BillCollectionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillCollectionListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BillCollectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
