import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaInformationComponent } from './area-information-form.component';

describe('AreaInformationComponent', () => {
  let component: AreaInformationComponent;
  let fixture: ComponentFixture<AreaInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaInformationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AreaInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
