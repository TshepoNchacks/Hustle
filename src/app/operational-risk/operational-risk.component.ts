import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Risk, RiskService } from '../services/risk.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { User, UserService } from '../user.service';
import { AccountService } from '../account.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';

interface ORisk {
  id: number;
  riskNumber: string;
  operationalObjective: string;
  riskDescription: string;
  rootCauses?: string;
  consequences?: string;
  inherentProbability?: number;
  inherentImpact?: number;
  overallInherentRisk?: number;
  existingControls?: string;
  typeOfControl?: string;
  residualProbability?: number;
  residualImpact?: number;
  overallResidualRisk?: number;
  riskStatus?: string;
  mitigatingPlan?: string;
  riskOwner?: string;
  responsiblePerson?: string;
  completionDate?: string;
  capturedDate: string;
  planStatus?: string;
}

interface ActionPlan {
  action: string;
  dueDate: Date;
  progress: string;
}

@Component({
  selector: 'app-operational-risk',
  templateUrl: './operational-risk.component.html',
  styleUrls: ['./operational-risk.component.css'],
  standalone: false
})
export class OperationalRiskComponent implements OnInit {
  riskForm!: FormGroup;
  reportContent: string | null = null;
  exportFormat: string = 'pdf';

  showForm = false;
  updateForm = false;
  showCaptureList = false;
  showCaptureListActionPlan = false;
  isEditing = false;
  capturedRisks: any[] = [];
  editingRiskId: number | null = null;

  successMessage: string | null = null;
  searchTerm: string = '';
  riskCounter: number = 0;

  currentUser: any;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['riskNumber', 'operationalObjective', 'riskDescription', 'riskOwner', 'capturedDate', 'actions'];

  dataSource1 = new MatTableDataSource<any>();
  displayedColumns1: string[] = ['riskNumber', 'operationalObjective', 'status', 'capturedDate', 'actions'];

  users: User[] = [];
  reportData: any[] = [];
  showChart = false;

  riskStats: { status: string, count: number, percent: number }[] = [];

  actionPlanForm!: FormGroup;
  actionPlans: any[] = [];
  editIndex: number | null = null;

  chartTypes: ChartType[] = ['pie', 'bar', 'doughnut'];
  selectedChartType: ChartType = 'pie';

  chartLabels: string[] = [];
  chartData: any = {
    labels: [],
    datasets: [{ data: [] }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } }
  };

  statusColorMap: { [status: string]: string } = {
    'Completed': '#4caf50',
    'In progress': '#ff9800',
    'Not started': '#9e9e9e',
    'Overdue': '#f44336'
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output() backToDashboard = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private riskService: RiskService,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private accountService: AccountService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(users => this.users = users);
    this.currentUser = this.accountService.getUser();

    this.riskForm = this.fb.group({
      riskNumber: [''],
      capturedDate: [''],
      operationalObjective: ['', Validators.required],
      riskDescription: ['', Validators.required],
      rootCauses: ['', Validators.required],
      consequences: ['', Validators.required],
      inherentProbability: [null, Validators.required],
      inherentImpact: [null, Validators.required],
      inherentRisk: [{ value: 0, disabled: true }],
      existingControls: [''],
      controlType: ['', Validators.required],
      residualProbability: [null, Validators.required],
      residualImpact: [null, Validators.required],
      residualRisk: [{ value: 0, disabled: true }],
      riskStatus1: [{ value: '', disabled: true }],
      riskStatus: [{ value: '', disabled: true }],
      mitigatingPlan: ['', Validators.required],
      riskOwner: ['', Validators.required],
      responsiblePerson: ['', Validators.required],
      completionDate: ['', Validators.required]
    });

    this.riskForm.valueChanges.subscribe(() => this.calculateRisk());

    this.loadCapturedRisks();
    this.loadCapturedRisksActionProgress();

    this.actionPlanForm = this.fb.group({
      actionPlan: ['', Validators.required],
      dueDate: ['', Validators.required],
      progress: ['', Validators.required],
      planStatus: ['', Validators.required]
    });
  }

  calculateRisk() {
    const prob = Number(this.riskForm.get('inherentProbability')?.value) || 0;
    const impact = Number(this.riskForm.get('inherentImpact')?.value) || 0;
    const residualProb = Number(this.riskForm.get('residualProbability')?.value) || 0;
    const residualImpact = Number(this.riskForm.get('residualImpact')?.value) || 0;

    const inherentRisk = prob * impact;
    const residualRisk = residualProb * residualImpact;

    const riskStatus1 = this.getRiskLevel(inherentRisk);
    const riskStatus = this.getRiskLevel(residualRisk);

    this.riskForm.patchValue({ inherentRisk, residualRisk, riskStatus1, riskStatus }, { emitEvent: false });
  }

  getRiskLevel(value: number): string {
    if (value >= 11) return 'High';
    if (value >= 6) return 'Medium';
    return 'Low';
  }

  submitRiskForm() {
    this.calculateRisk();
    const formValue = this.riskForm.getRawValue();

    const formattedCapturedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
    const formattedActionPlans = (this.actionPlans || [])
      .map(plan => ({
        actionPlan: plan.actionPlan?.trim() || '',
        dueDate: this.datePipe.transform(plan.dueDate, 'yyyy-MM-dd') || '',
        planStatus: plan.planStatus?.trim() || '',
        progress: plan.progress?.trim() || ''
      }))
      .filter(plan => plan.actionPlan && plan.dueDate && plan.planStatus);

    if (this.isEditing && this.editingRiskId !== null) {
      const existingRisk = this.capturedRisks.find(r => r.id === this.editingRiskId);
      const updatedRisk: ORisk = {
        ...formValue,
        id: this.editingRiskId,
        riskNumber: existingRisk?.riskNumber || '',
        capturedDate: existingRisk?.capturedDate || formattedCapturedDate,
        actionPlans: formattedActionPlans
      };
      this.riskService.updateRisk(this.editingRiskId, updatedRisk).subscribe({
        next: (risk) => {
          const index = this.capturedRisks.findIndex(r => r.id === this.editingRiskId);
          if (index !== -1) this.capturedRisks[index] = risk;
          this.snackBar.open('Risk updated successfully!', 'Close', { duration: 3000 });
          this.finishFormSubmission();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to update risk.', 'Close', { duration: 3000 });
        }
      });
    } else {
      const newRisk: ORisk = {
        ...formValue,
        riskNumber: this.generateRiskNumber(),
        capturedDate: formattedCapturedDate,
        actionPlans: formattedActionPlans
      };
      this.riskService.createRisk(newRisk).subscribe({
        next: (risk) => {
          this.capturedRisks.push(risk);
          this.snackBar.open('New risk captured successfully!', 'Close', { duration: 3000 });
          this.finishFormSubmission();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to create risk.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  finishFormSubmission() {
    localStorage.setItem('capturedOperationalRisks', JSON.stringify(this.capturedRisks));
    this.showForm = false;
    this.updateForm = false;
    this.showCaptureList = true;
    this.loadCapturedRisks();
    this.loadCapturedRisksActionProgress();
  }

  goBack(): void {
    this.showForm = false;
    this.updateForm = false;
    this.showCaptureList = false;
    this.showCaptureListActionPlan = false;
    this.showChart = false;
  }

  
  startNewRisk() {
    this.showCaptureList = true;
    this.showForm = false;
    this.updateForm = false;
    this.isEditing = false;
    this.editingRiskId = null;
    this.loadCapturedRisks();
    
  }

  addNewRisk() {
    this.showForm = true;
    this.updateForm = false;
    this.showCaptureList = false;
    this.isEditing = false;
    this.editingRiskId = null;

    this.riskForm.reset({
      riskNumber: this.generateRiskNumber(),
      capturedDate: this.formatDate(new Date())
    });
  }

  editRisk(risk: any) {
    this.showForm = true;
    this.updateForm = false;
    this.showCaptureList = false;
    this.isEditing = true;
    this.editingRiskId = risk.id;
    this.actionPlans = risk.actionPlans ? [...risk.actionPlans] : [];

    this.riskForm.patchValue({
      operationalObjective: risk.operationalObjective,
      riskDescription: risk.riskDescription,
      rootCauses: risk.rootCauses,
      consequences: risk.consequences,
      inherentProbability: risk.inherentProbability,
      inherentImpact: risk.inherentImpact,
      inherentRisk: risk.inherentRisk,
      existingControls: risk.existingControls,
      controlType: risk.controlType,
      residualProbability: risk.residualProbability,
      residualImpact: risk.residualImpact,
      residualRisk: risk.residualRisk,
      riskStatus1: risk.riskStatus1,
      riskStatus: risk.riskStatus,
      mitigatingPlan: risk.mitigatingPlan,
      riskOwner: risk.riskOwner,
      responsiblePerson: risk.responsiblePerson,
      completionDate: risk.completionDate
    });
  }

  editProgress(risk: any) {
  // Set form states
  this.updateForm = true;
  this.showForm = false;
  this.showCaptureList = false;
  this.showCaptureListActionPlan = false;
  this.isEditing = true;
  this.editingRiskId = risk.id;

  // Load individual action plans if they exist
  this.actionPlans = risk.actionPlans ? [...risk.actionPlans] : [];
  // this.actionPlans = risk.actionPlans ? [...risk.actionPlans] : [];


  // Reset the sub-form (actionPlanForm)
  this.actionPlanForm.reset({
    actionPlan: '',
    dueDate: '',
    progress: '',
    planStatus: ''
  });

  // Patch the main risk form (even though it won't be submitted here)
  this.riskForm.patchValue({
    operationalObjective: risk.operationalObjective,
      riskDescription: risk.riskDescription,
      rootCauses: risk.rootCauses,
      consequences: risk.consequences,
      inherentProbability: risk.inherentProbability,
      inherentImpact: risk.inherentImpact,
      inherentRisk: risk.inherentRisk,
      existingControls: risk.existingControls,
      controlType: risk.controlType,
      residualProbability: risk.residualProbability,
      residualImpact: risk.residualImpact,
      residualRisk: risk.residualRisk,
      riskStatus1: risk.riskStatus1,
      riskStatus: risk.riskStatus,
      mitigatingPlan: risk.mitigatingPlan,
      riskOwner: risk.riskOwner,
      responsiblePerson: risk.responsiblePerson,
      completionDate: risk.completionDate
  });
}

filteredCapturedRisks(): any[] {
  if (!this.searchTerm) {
    return this.capturedRisks;
  }

  const lowerSearch = this.searchTerm.toLowerCase();
  const filtered = this.capturedRisks.filter(risk =>
    (risk.strategicObjective?.toLowerCase().includes(lowerSearch) || 
     risk.riskOwner?.toLowerCase().includes(lowerSearch))
  );

  this.dataSource = new MatTableDataSource(filtered);
  this.dataSource.paginator = this.paginator;

  return filtered;
}

  generateRiskNumber(): string {
    const prefix = 'OPR';
    const year = new Date().getFullYear();
    this.riskCounter++;
    const number = this.riskCounter.toString().padStart(3, '0');
    return `${prefix}-${year}-${number}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  onAddOrUpdate() {
    if (this.actionPlanForm.invalid) {
      this.actionPlanForm.markAllAsTouched();
      return;
    }
    const actionPlan = this.actionPlanForm.value;

    if (this.isEditing && this.editIndex !== null) {
      this.actionPlans[this.editIndex] = actionPlan;
      this.isEditing = false;
      this.editIndex = null;
    } else {
      this.actionPlans.push(actionPlan);
    }
    this.actionPlanForm.reset();
  }

  editActionPlan(index: number) {
    const selected = this.actionPlans[index];
    this.actionPlanForm.patchValue(selected);
    this.isEditing = true;
    this.editIndex = index;
  }

  
deleteRisk(id: number) {
  this.capturedRisks = this.capturedRisks.filter(r => r.id !== id);
  localStorage.setItem('capturedStrategicRisks', JSON.stringify(this.capturedRisks));
}

  deleteActionPlan(index: number) {
    this.actionPlans.splice(index, 1);
    if (this.editIndex === index) this.cancelEdit();
  }

  cancelEdit() {
    this.actionPlanForm.reset();
    this.isEditing = false;
    this.editIndex = null;
  }

  loadCapturedRisks() {
    this.riskService.getRisks().subscribe({
      next: (risks) => {
        const filtered = this.currentUser.role === 'SuperAdmin' ? risks : risks.filter(r => r.ownerId === this.currentUser.id || r.riskOwner === this.currentUser.username);
        this.capturedRisks = filtered;
        this.dataSource = new MatTableDataSource(this.capturedRisks);
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => console.error(err)
    });
  }

  updateProgress() {
    // Toggle to show the progress table and hide others
    this.showCaptureListActionPlan = true;
    this.showForm = false;
    this.updateForm = false;
    this.isEditing = false;
    this.editingRiskId = null;
    
    // Assuming progress data has a similar structure, you may want to filter or fetch action plan progress data here
    this.loadCapturedRisksActionProgress();

    console.log(this.dataSource1.data);
  }

  loadCapturedRisksActionProgress() {
    this.riskService.getRisks().subscribe({
      next: (risks) => {
        const filtered = this.currentUser.role === 'SuperAdmin' ? risks : risks.filter(r => r.ownerId === this.currentUser.id || r.riskOwner === this.currentUser.username);
        const progressRisks = filtered.map(r => ({ ...r, status: r.planStatus }));
        this.dataSource1 = new MatTableDataSource(progressRisks);
        this.dataSource1.paginator = this.paginator;
      },
      error: (err) => console.error(err)
    });
  }
    applyFilter() {
    const filtered = this.filteredCapturedRisks();
    this.dataSource = new MatTableDataSource(filtered);
    this.dataSource.paginator = this.paginator;
  }

  onSearchChange() {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  generateReport() {
  this.riskService.getRisks().subscribe((risks: any[]) => {
    this.capturedRisks = risks;

    const statsMap = new Map<string, number>();

    // Loop over each risk and its actionPlans[]
    risks.forEach(risk => {
      if (risk.actionPlans && Array.isArray(risk.actionPlans)) {
        risk.actionPlans.forEach((plan: any) => {
          const status = plan.planStatus || 'Unknown';
          statsMap.set(status, (statsMap.get(status) || 0) + 1);
        });
      } else {
        statsMap.set('No Plan', (statsMap.get('No Plan') || 0) + 1);
      }
    });

    const total = Array.from(statsMap.values()).reduce((sum, count) => sum + count, 0);

    this.riskStats = Array.from(statsMap.entries()).map(([status, count]) => ({
  status,
  count,
  percent: parseFloat(((count / total) * 100).toFixed(1))
}));

// Set colors based on planStatus
const backgroundColors = this.riskStats.map(stat =>
  this.statusColorMap[stat.status] || '#607d8b'
);

this.chartData = {
  labels: this.riskStats.map(stat => stat.status),
  datasets: [{
    data: this.riskStats.map(stat => stat.count),
    backgroundColor: backgroundColors,
    borderColor: '#ffffff',
    borderWidth: 2
  }]
};
    this.showChart = true;
    this.showForm = false;
    this.updateForm = false;
    this.showCaptureList = false;
    this.showCaptureListActionPlan = false;
  });
}

}
