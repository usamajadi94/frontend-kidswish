import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BftInputTextComponent } from './bft-input-text.component';

describe('BftInputTextComponent', () => {
  let component: BftInputTextComponent;
  let fixture: ComponentFixture<BftInputTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BftInputTextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BftInputTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
