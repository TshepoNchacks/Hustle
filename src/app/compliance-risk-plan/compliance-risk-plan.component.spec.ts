import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceRiskPlanComponent } from './compliance-risk-plan.component';

describe('ComplianceRiskPlanComponent', () => {
  let component: ComplianceRiskPlanComponent;
  let fixture: ComponentFixture<ComplianceRiskPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplianceRiskPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComplianceRiskPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
