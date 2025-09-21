import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteInformationListComponent } from './route-information-list.component';

describe('RouteInformationListComponent', () => {
  let component: RouteInformationListComponent;
  let fixture: ComponentFixture<RouteInformationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteInformationListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RouteInformationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
