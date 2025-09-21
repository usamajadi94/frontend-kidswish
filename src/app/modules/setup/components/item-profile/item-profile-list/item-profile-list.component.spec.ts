import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemProfileListComponent } from './item-profile-list.component';

describe('ItemProfileListComponent', () => {
  let component: ItemProfileListComponent;
  let fixture: ComponentFixture<ItemProfileListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemProfileListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ItemProfileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
