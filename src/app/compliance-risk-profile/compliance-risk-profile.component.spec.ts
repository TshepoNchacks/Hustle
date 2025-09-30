import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceRiskProfileComponent } from './compliance-risk-profile.component';

describe('ComplianceRiskProfileComponent', () => {
  let component: ComplianceRiskProfileComponent;
  let fixture: ComponentFixture<ComplianceRiskProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceRiskProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComplianceRiskProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
