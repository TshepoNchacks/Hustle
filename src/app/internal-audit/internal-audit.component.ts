import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-internal-audit',
    templateUrl: './internal-audit.component.html',
    styleUrls: ['./internal-audit.component.css'],
    standalone: false
})
export class InternalAuditComponent {
  auditForm: FormGroup;
  auditReportContent: string = '';

  constructor(private fb: FormBuilder) {
    this.auditForm = this.fb.group({
      finding: ['', Validators.required],
      category: ['', Validators.required],
      actionPlan: ['', Validators.required],
      dueDate: ['', Validators.required],
      responsiblePerson: ['', Validators.required],
      progress: [''],
      planStatus: ['', Validators.required],
      findingStatus: ['', Validators.required],
      poe: [null]
    });
  }

  submitAuditForm() {
    if (this.auditForm.valid) {
      console.log('Audit Form Submitted:', this.auditForm.value);
      // Your save logic here
    }
  }

  generateAuditReport() {
    if (this.auditForm.valid) {
      const values = this.auditForm.value;
      this.auditReportContent = `
        <h3>Audit Report</h3>
        <p><strong>Finding:</strong> ${values.finding}</p>
        <p><strong>Category:</strong> ${values.category}</p>
        <p><strong>Action Plan:</strong> ${values.actionPlan}</p>
        <p><strong>Due Date:</strong> ${values.dueDate}</p>
        <p><strong>Responsible Person:</strong> ${values.responsiblePerson}</p>
        <p><strong>Progress:</strong> ${values.progress}</p>
        <p><strong>Plan Status:</strong> ${values.planStatus}</p>
        <p><strong>Finding Status:</strong> ${values.findingStatus}</p>
      `;
    }
  }
}
