import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportViewerToolComponent } from './report-viewer-tool.component';

describe('ReportViewerToolComponent', () => {
  let component: ReportViewerToolComponent;
  let fixture: ComponentFixture<ReportViewerToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportViewerToolComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportViewerToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
