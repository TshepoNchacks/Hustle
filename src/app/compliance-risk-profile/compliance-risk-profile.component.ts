import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-compliance-risk-profile',
    templateUrl: './compliance-risk-profile.component.html',
    styleUrls: ['./compliance-risk-profile.component.css'],
    standalone: false
})
export class ComplianceRiskProfileComponent implements OnInit {
  
  riskForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.riskForm = this.fb.group({
      category: ['', Validators.required],
      inherentProbability: [null, Validators.required],
      inherentImpact: [null, Validators.required],
      overallInherentRisk: [{ value: '', disabled: true }],
      existingControls: ['', Validators.required],
      residualProbability: [null, Validators.required],
      residualImpact: [null, Validators.required],
      overallResidualRisk: [{ value: '', disabled: true }],
      riskStatus: [{ value: '', disabled: true }],
      mitigatingPlan: ['', Validators.required],
      actionPlanOwner: ['', Validators.required],
      responsiblePerson: ['', Validators.required],
      completionDate: ['', Validators.required],
    });

    this.riskForm.get('inherentProbability')?.valueChanges.subscribe(() => this.calculateInherentRisk());
    this.riskForm.get('inherentImpact')?.valueChanges.subscribe(() => this.calculateInherentRisk());
    this.riskForm.get('residualProbability')?.valueChanges.subscribe(() => this.calculateResidualRisk());
    this.riskForm.get('residualImpact')?.valueChanges.subscribe(() => this.calculateResidualRisk());
  }

  calculateInherentRisk() {
    const probability = this.riskForm.get('inherentProbability')?.value || 0;
    const impact = this.riskForm.get('inherentImpact')?.value || 0;
    const risk = probability * impact;
    this.riskForm.patchValue({ overallInherentRisk: risk });
  }

  calculateResidualRisk() {
    const probability = this.riskForm.get('residualProbability')?.value || 0;
    const impact = this.riskForm.get('residualImpact')?.value || 0;
    const risk = probability * impact;
    let status = 'Low';

    if (risk > 15) status = 'High';
    else if (risk > 5) status = 'Medium';

    this.riskForm.patchValue({ overallResidualRisk: risk, riskStatus: status });
  }

  onSubmit() {
    console.log(this.riskForm.value);
  }

  generateReport() {
    
  }
}