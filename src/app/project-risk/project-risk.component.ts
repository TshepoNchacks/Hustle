import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-project-risk',
    templateUrl: './project-risk.component.html',
    styleUrl: './project-risk.component.css',
    standalone: false
})
export class ProjectRiskComponent implements OnInit {
  projectForm!: FormGroup;
  reportContent: string = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      projectRiskDescription: ['', Validators.required],
      rootCauses: ['', Validators.required],
      consequences: ['', Validators.required],

      inherentProbability: [, Validators.required],
      inherentImpact: [, Validators.required],
      inherentRisk: [{ value: '', disabled: true }],

      existingControls: [''],
      controlType: ['Preventive'],

      residualProbability: [, Validators.required],
      residualImpact: [, Validators.required],
      residualRisk: [{ value: '', disabled: true }],

      riskStatus: [{ value: '', disabled: true }],
      mitigatingPlan: [''],
      riskOwner: [''],
      responsiblePerson: [''],
      completionDate: ['']
    });

    this.projectForm.get('inherentProbability')?.valueChanges.subscribe(() => this.updateInherentRisk());
    this.projectForm.get('inherentImpact')?.valueChanges.subscribe(() => this.updateInherentRisk());

    this.projectForm.get('residualProbability')?.valueChanges.subscribe(() => this.updateResidualRisk());
    this.projectForm.get('residualImpact')?.valueChanges.subscribe(() => this.updateResidualRisk());

    this.updateInherentRisk();
    this.updateResidualRisk();
  }

  updateInherentRisk(): void {
    const prob = this.projectForm.get('inherentProbability')?.value || 0;
    const impact = this.projectForm.get('inherentImpact')?.value || 0;
    const score = prob * impact;
    this.projectForm.get('inherentRisk')?.setValue(score);
  }

  updateResidualRisk(): void {
    const prob = this.projectForm.get('residualProbability')?.value || 0;
    const impact = this.projectForm.get('residualImpact')?.value || 0;
    const score = prob * impact;
    this.projectForm.get('residualRisk')?.setValue(score);
    this.updateRiskStatus(score);
  }

  updateRiskStatus(score: number): void {
    let status = 'Low';
    if (score >= 15) {
      status = 'High';
    } else if (score >= 8) {
      status = 'Medium';
    }
    this.projectForm.get('riskStatus')?.setValue(status);
  }

  submitProjectForm(): void {
    if (this.projectForm.valid) {
      console.log('Submitted Project Risk:', this.projectForm.getRawValue());
      alert('Project risk submitted successfully!');
    }
  }

  generateReport(): void {
    const data = this.projectForm.getRawValue();
    this.reportContent = `
      <h3>Project Risk Report</h3>
      <p><strong>Description:</strong> ${data.projectRiskDescription}</p>
      <p><strong>Root Causes:</strong> ${data.rootCauses}</p>
      <p><strong>Consequences:</strong> ${data.consequences}</p>
      <hr>
      <p><strong>Inherent Risk:</strong> Probability ${data.inherentProbability} x Impact ${data.inherentImpact} = ${data.inherentRisk}</p>
      <p><strong>Existing Controls:</strong> ${data.existingControls} (${data.controlType})</p>
      <p><strong>Residual Risk:</strong> Probability ${data.residualProbability} x Impact ${data.residualImpact} = ${data.residualRisk}</p>
      <p><strong>Risk Status:</strong> ${data.riskStatus}</p>
      <p><strong>Mitigating Plan:</strong> ${data.mitigatingPlan}</p>
      <p><strong>Risk Owner:</strong> ${data.riskOwner}</p>
      <p><strong>Responsible Person:</strong> ${data.responsiblePerson}</p>
      <p><strong>Completion Date:</strong> ${data.completionDate}</p>
    `;
  }
}