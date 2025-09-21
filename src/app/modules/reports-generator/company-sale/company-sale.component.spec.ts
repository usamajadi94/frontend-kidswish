import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySaleComponent } from './company-sale.component';

describe('CompanySaleComponent', () => {
  let component: CompanySaleComponent;
  let fixture: ComponentFixture<CompanySaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanySaleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanySaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
