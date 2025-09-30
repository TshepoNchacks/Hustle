import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalAuditComponent } from './external-audit.component';

describe('ExternalAuditComponent', () => {
  let component: ExternalAuditComponent;
  let fixture: ComponentFixture<ExternalAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalAuditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExternalAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
