import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RiskService } from '../services/risk.service';


@Component({
    selector: 'app-compliance-risk-plan',
    templateUrl: './compliance-risk-plan.component.html',
    styleUrl: './compliance-risk-plan.component.css',
    standalone: false
})
export class ComplianceRiskPlanComponent {
  complianceForm!: FormGroup;
  reportContent: string = '';

  constructor(private fb: FormBuilder, private riskService: RiskService) {}

  ngOnInit(): void {
    this.complianceForm = this.fb.group({
      section: ['', Validators.required],
      complianceProvision: ['', Validators.required],
      plainLanguageInterpretation: ['', Validators.required],

      inherentProbability: ['', Validators.required],
      inherentImpact: ['', Validators.required],
      inherentRisk: [{ value: '', disabled: true }],

      existingControls: [''],
      controlType: [''],

      residualProbability: ['', Validators.required],
      residualImpact: ['', Validators.required],
      residualRisk: [{ value: '', disabled: true }],

      riskStatus: [{ value: '', disabled: true }],
      mitigatingPlan: [''],
      riskOwner: [''],
      responsiblePerson: [''],
      completionDate: ['']
    });

    this.complianceForm.get('inherentProbability')?.valueChanges.subscribe(() => this.updateInherentRisk());
    this.complianceForm.get('inherentImpact')?.valueChanges.subscribe(() => this.updateInherentRisk());

    this.complianceForm.get('residualProbability')?.valueChanges.subscribe(() => this.updateResidualRisk());
    this.complianceForm.get('residualImpact')?.valueChanges.subscribe(() => this.updateResidualRisk());

    this.updateInherentRisk();
    this.updateResidualRisk();
  }

  updateInherentRisk(): void {
    const prob = this.complianceForm.get('inherentProbability')?.value || 0;
    const impact = this.complianceForm.get('inherentImpact')?.value || 0;
    const score = prob * impact;
    this.complianceForm.get('inherentRisk')?.setValue(score);
  }

  updateResidualRisk(): void {
    const prob = this.complianceForm.get('residualProbability')?.value || 0;
    const impact = this.complianceForm.get('residualImpact')?.value || 0;
    const score = prob * impact;
    this.complianceForm.get('residualRisk')?.setValue(score);
    this.updateRiskStatus(score);
  }

  updateRiskStatus(score: number): void {
    let status = 'Low';
    if (score >= 15) {
      status = 'High';
    } else if (score >= 8) {
      status = 'Medium';
    }
    this.complianceForm.get('riskStatus')?.setValue(status);
  }

  // submitComplianceForm(): void {

  //   if (this.complianceForm.valid) {
  //     this.riskService.submitComplianceRiskProfile(this.complianceForm.getRawValue()).subscribe({
  //       next: res => alert(res.message),
  //       error: err => alert('Submission failed: ' + err.message)
  //     });
  //   }
  //   if (this.complianceForm.valid) {
  //     console.log('Submitted Compliance Risk:', this.complianceForm.getRawValue());
  //     alert('Compliance risk submitted successfully!');
  //   }
  // }

  // generateComplianceReport(): void {
  //   this.riskService.generateComplianceReport().subscribe({
  //     next: res => this.reportContent = res.report,
  //     error: err => alert('Report fetch failed: ' + err.message)
  //   });
  //   console.log('REPORT:', this.complianceForm.getRawValue());
  // }

  
}