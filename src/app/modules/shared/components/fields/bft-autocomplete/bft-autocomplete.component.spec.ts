import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BftAutocompleteComponent } from './bft-autocomplete.component';

describe('BftAutocompleteComponent', () => {
  let component: BftAutocompleteComponent;
  let fixture: ComponentFixture<BftAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BftAutocompleteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BftAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
