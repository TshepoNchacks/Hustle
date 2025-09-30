import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

interface FraudRisk {
  id: number;
  fraudRiskNumber: string;
  fraudRiskDescription: string;
  rootCauses: string;
  consequences: string;
  inherentProbability: number;
  inherentImpact: number;
  inherentRisk: number;
  existingControls: string;
  controlType: string;
  residualProbability: number;
  residualImpact: number;
  residualRisk: number;
  riskStatus: string;
  mitigatingPlan: string;
  riskOwner: string;
  responsiblePerson: string;
  completionDate: string;
  capturedDate: string;
  actionPlans: ActionPlan[];
}

interface ActionPlan {
  actionPlan: string;
  dueDate: string;
  progress: string;
  planStatus: string;
}

@Component({
  selector: 'app-fraud-risk',
  templateUrl: './fraud-risk.component.html',
  styleUrls: ['./fraud-risk.component.css'],
  standalone: false
})
export class FraudRiskComponent implements OnInit {
updateFraudProgress() {
throw new Error('Method not implemented.');
}
closeAlert() {
throw new Error('Method not implemented.');
}

  fraudForm!: FormGroup;
  actionPlanForm!: FormGroup;

  showForm = false;
  updateForm = false;
  showCaptureList = false;
  showCaptureListActionPlan = false;
  showChart = false;

  isEditing = false;

  fraudRisks: FraudRisk[] = [];
  dataSource = new MatTableDataSource<FraudRisk>([]);
  displayedColumns: string[] = ['fraudRiskNumber','fraudRiskDescription','riskOwner','capturedDate','actions'];

  actionPlans: ActionPlan[] = [];
  dataSourceActionPlans = new MatTableDataSource<ActionPlan>();
  
  searchTerm = '';
  successMessage = '';
  reportContent = '';

  chartTypes = ['bar', 'pie', 'doughnut'];
  selectedChartType = 'bar';
  chartData: any;
  chartOptions: any;
  riskStats: {status:string, count:number, percent:number}[] = [];

  users = [
    { username: 'Owner A', role: 'Manager' },
    { username: 'Owner B', role: 'Analyst' },
    { username: 'Person A', role: 'Officer' },
    { username: 'Person B', role: 'Auditor' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
currentUser: any;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForms();
    this.dataSource.paginator = this.paginator;
  }

  initForms() {
    this.fraudForm = this.fb.group({
      fraudRiskDescription: ['', Validators.required],
      rootCauses: [''],
      consequences: [''],
      inherentProbability: [1],
      inherentImpact: [1],
      inherentRisk: [{value: '', disabled: true}],
      existingControls: [''],
      controlType: ['Preventive'],
      residualProbability: [1],
      residualImpact: [1],
      residualRisk: [{value:'', disabled:true}],
      riskStatus: [{value:'', disabled:true}],
      mitigatingPlan: [''],
      riskOwner: ['', Validators.required],
      responsiblePerson: ['', Validators.required],
      completionDate: ['']
    });

    this.actionPlanForm = this.fb.group({
      actionPlan: ['', Validators.required],
      dueDate: ['', Validators.required],
      progress: [''],
      planStatus: ['', Validators.required]
    });

    this.fraudForm.valueChanges.subscribe(() => this.calculateRisks());
  }

  calculateRisks() {
    const f = this.fraudForm;
    const inherent = f.get('inherentProbability')!.value * f.get('inherentImpact')!.value;
    const residual = f.get('residualProbability')!.value * f.get('residualImpact')!.value;

    f.get('inherentRisk')!.setValue(inherent);
    f.get('residualRisk')!.setValue(residual);

    // Example Risk Status
    f.get('riskStatus')!.setValue(inherent >= 15 ? 'High' : inherent >= 8 ? 'Medium' : 'Low');
  }

  startNewFraudRisk() {
    this.showForm = true;
    this.isEditing = false;
    this.fraudForm.reset({inherentProbability:1, inherentImpact:1, residualProbability:1, residualImpact:1, controlType:'Preventive'});
    this.actionPlans = [];
  }

  addNewFraudRisk() {
    this.showCaptureList = false;
    this.showForm = true;
  }

  editFraudRisk(risk: FraudRisk) {
    this.showForm = true;
    this.isEditing = true;
    this.fraudForm.patchValue(risk);
    this.actionPlans = [...risk['actionPlans'] || []];
  }

  deleteFraudRisk(id:number) {
    this.fraudRisks = this.fraudRisks.filter(r => r.id !== id);
    this.dataSource.data = this.fraudRisks;
    this.successMessage = 'Fraud risk deleted successfully';
  }

  onAddOrUpdate() {
    if(this.actionPlanForm.invalid) return;

    const plan: ActionPlan = {...this.actionPlanForm.value};
    if(this.isEditing && this.editingPlanIndex !== -1) {
      this.actionPlans[this.editingPlanIndex] = plan;
      this.editingPlanIndex = -1;
    } else {
      this.actionPlans.push(plan);
    }
    this.actionPlanForm.reset();
  }

  editingPlanIndex = -1;
  editActionPlan(index:number) {
    this.editingPlanIndex = index;
    this.actionPlanForm.patchValue(this.actionPlans[index]);
  }

  deleteActionPlan(index:number) {
    this.actionPlans.splice(index,1);
  }

  submitFraudForm() {
    if(this.fraudForm.invalid) return;

    const newRisk: FraudRisk = {
      id: Date.now(),
      fraudRiskNumber: `FR-${Date.now()}`,
      fraudRiskDescription: this.fraudForm.get('fraudRiskDescription')!.value,
      rootCauses: this.fraudForm.get('rootCauses')!.value,
      consequences: this.fraudForm.get('consequences')!.value,
      inherentProbability: this.fraudForm.get('inherentProbability')!.value,
      inherentImpact: this.fraudForm.get('inherentImpact')!.value,
      inherentRisk: this.fraudForm.get('inherentRisk')!.value,
      existingControls: this.fraudForm.get('existingControls')!.value,
      controlType: this.fraudForm.get('controlType')!.value,
      residualProbability: this.fraudForm.get('residualProbability')!.value,
      residualImpact: this.fraudForm.get('residualImpact')!.value,
      residualRisk: this.fraudForm.get('residualRisk')!.value,
      riskStatus: this.fraudForm.get('riskStatus')!.value,
      mitigatingPlan: this.fraudForm.get('mitigatingPlan')!.value,
      riskOwner: this.fraudForm.get('riskOwner')!.value,
      responsiblePerson: this.fraudForm.get('responsiblePerson')!.value,
      completionDate: this.fraudForm.get('completionDate')!.value,
      capturedDate: new Date().toISOString(),
      actionPlans: [...this.actionPlans]
    };

    if(this.isEditing) {
      const index = this.fraudRisks.findIndex(r => r.id === newRisk.id);
      this.fraudRisks[index] = newRisk;
    } else {
      this.fraudRisks.push(newRisk);
    }

    this.dataSource.data = this.fraudRisks;
    this.showForm = false;
    this.successMessage = 'Fraud Risk saved successfully';
  }

  onSearchChange() {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  generateFraudReport() {
    this.reportContent = '<h3>Fraud Risk Report</h3>';
    this.fraudRisks.forEach(r => {
      this.reportContent += `<p>${r.fraudRiskDescription} - Status: ${r.riskStatus}</p>`;
    });
  }

  goBack() {
    this.showForm = false;
    this.showCaptureList = true;
    this.updateForm = false;
    this.showCaptureListActionPlan = false;
    this.showChart = false;
  }

}
