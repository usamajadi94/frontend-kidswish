import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultToastComponent } from './result-toast.component';

describe('ResultToastComponent', () => {
  let component: ResultToastComponent;
  let fixture: ComponentFixture<ResultToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultToastComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResultToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
