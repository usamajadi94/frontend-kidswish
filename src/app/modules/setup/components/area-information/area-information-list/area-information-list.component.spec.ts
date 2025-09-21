import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaInformationListComponent } from './area-information-list.component';

describe('AreaInformationListComponent', () => {
  let component: AreaInformationListComponent;
  let fixture: ComponentFixture<AreaInformationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaInformationListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AreaInformationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
