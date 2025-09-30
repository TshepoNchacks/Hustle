import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Risk, RiskService } from '../services/risk.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { User, UserService } from '../user.service';
import { AccountService } from '../account.service';

import { ChartConfiguration, ChartType } from 'chart.js';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';



@Component({
    selector: 'app-strategic-risk',
    templateUrl: './strategic-risk.component.html',
    styleUrls: ['./strategic-risk.component.css'],
    standalone: false
})
export class StrategicRiskComponent implements OnInit {
  riskForm!: FormGroup;
  reportContent: string | null = null;
  exportFormat: string = 'pdf'; // default to PDF

  showForm: boolean = false;
  updateForm: boolean = false;
showCaptureList: boolean = false;
showCaptureListActionPlan: boolean = false;
isEditing: boolean = false;
capturedRisks: any[] = []; // Mock captured risks list
editingRiskId: number | null = null;

successMessage: string | null = null;
searchTerm: string = '';
riskCounter: number = 0;

currentUser: any;             

dataSource = new MatTableDataSource<any>();
displayedColumns: string[] = ['riskNumber', 'strategicObjective', 'riskDescription', 'riskOwner', 'capturedDate', 'actions'];


dataSource1 = new MatTableDataSource<any>();
displayedColumns1: string[] = ['riskNumber', 'strategicObjective', 'status', 'capturedDate', 'actions'];

// users: any[] = [];
users: User[] = [];

reportData: any[] = [];       // ← raw array of risks from the service
  showChart = false;

  // public riskStats: { status: string, count: number, percent: number }[] = [];
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
  plugins: {
    legend: {
      display: false   // ✅ Hide the legend area
    }
  }
};


statusColorMap: { [status: string]: string } = {
  'Completed': '#4caf50',     // Green
  'In progress': '#ff9800',   // Orange
  'Not started': '#9e9e9e',   // Grey
  'Overdue': '#f44336',       // Red
  // 'No Plan': '#9c27b0'        // Purple
};

getTotalActionPlans(): number {
  if (!this.capturedRisks) return 0;
  return this.capturedRisks.reduce((total, risk) => {
    return total + (risk.actionPlans?.length || 0);
  }, 0);
}


@ViewChild(MatPaginator) paginator!: MatPaginator;

@Output() backToDashboard = new EventEmitter<void>();


  constructor(private fb: FormBuilder, private riskService: RiskService, private router: Router, private snackBar: MatSnackBar, private userService: UserService, private accountService: AccountService, private datePipe: DatePipe) {}

  ngOnInit() {

    // Load users from service
    this.userService.getUsers().subscribe(users => {
  this.users = users; // Now this.users is a plain array (User[])
});
    // 1️⃣ Get the logged-in user
    this.currentUser = this.accountService.getUser();

    this.riskForm = this.fb.group({
      riskNumber: [''],
      capturedDate: [''],
      strategicObjective: ['', Validators.required],
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
      completionDate: ['', Validators.required],
   
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
    // const prob = this.riskForm.get('inherentProbability')?.value || 0;
    // const impact = this.riskForm.get('inherentImpact')?.value || 0;
    // const residualProb = this.riskForm.get('residualProbability')?.value || 0;
    // const residualImpact = this.riskForm.get('residualImpact')?.value || 0;

    const prob = Number(this.riskForm.get('inherentProbability')?.value) || 0;
    const impact = Number(this.riskForm.get('inherentImpact')?.value) || 0;
    const residualProb = Number(this.riskForm.get('residualProbability')?.value) || 0;
    const residualImpact = Number(this.riskForm.get('residualImpact')?.value) || 0;
  
    const inherentRisk = prob * impact;
    const residualRisk = residualProb * residualImpact;
  
    const riskStatus1 = this.getRiskLevel(inherentRisk);
    const riskStatus = this.getRiskLevel(residualRisk);
  
    this.riskForm.patchValue(
      { inherentRisk, residualRisk, riskStatus1, riskStatus },
      { emitEvent: false }
    );
  }
  
  getRiskLevel(value: number): string {
    if (value >= 11) {
      return 'High';
    } else if (value >= 6) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }
  
  getRiskStatusClass(status: string): string {
    switch (status) {
      case 'High':
        return 'risk-high';
      case 'Medium':
        return 'risk-medium';
      case 'Low':
        return 'risk-low';
      default:
        return '';
    }
  }
  

submitRiskForm() {
  this.calculateRisk();
  const formValue = this.riskForm.getRawValue(); // Includes disabled fields
  console.log(this.riskForm.getRawValue());
  this.actionPlans = this.actionPlans || [];

  // Format captured date
  const formattedCapturedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';

  // Normalize and validate action plans
const formattedActionPlans = (this.actionPlans || [])
  .map(plan => ({
    actionPlan: plan.actionPlan?.trim() || '',
    dueDate: this.datePipe.transform(plan.dueDate, 'yyyy-MM-dd') || '',
    planStatus: plan.planStatus?.trim() || '',
    progress: plan.progress?.trim() || ''
  }))
  .filter(plan => plan.actionPlan && plan.dueDate && plan.planStatus);  // Ensure only valid plans are sent

  if (this.isEditing && this.editingRiskId !== null) {
    const existingRisk = this.capturedRisks.find(r => r.id === this.editingRiskId);

    const updatedRisk: Risk = {
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

        this.snackBar.open('Risk updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['custom-snackbar-center']
        });
        this.finishFormSubmission();
      },
      error: (err) => {
        console.error('Update failed', err);
        this.snackBar.open('Failed to update risk.', 'Close', { duration: 3000 });
      }
    });

  } else {
    const newRisk: Risk = {
      ...formValue,
      riskNumber: this.generateRiskNumber(),
      capturedDate: formattedCapturedDate,
      actionPlans: formattedActionPlans
    };
   console.log('Risk payload being sent:', newRisk);
    this.riskService.createRisk(newRisk).subscribe({
      next: (risk) => {
        this.capturedRisks.push(risk);

        this.snackBar.open('New risk captured successfully!', 'Close', {
          duration: 3000,
          panelClass: ['custom-snackbar-center']
        });
        this.finishFormSubmission();
      },
      error: (err) => {
        console.error('Create failed', err);
        this.snackBar.open('Failed to create risk.', 'Close', { duration: 3000 });
        console.error('Error details:', err?.error || err.message || err);
      }
    });
  }
}


// Common cleanup after submission
finishFormSubmission() {
  localStorage.setItem('capturedStrategicRisks', JSON.stringify(this.capturedRisks));
  this.showForm = false;
  this.updateForm = false;
  this.showCaptureList = true;
  this.loadCapturedRisks();
  this.loadCapturedRisksActionProgress();
}



updateActionPlan() {
  const formValue = this.riskForm.getRawValue();

  if (this.editingRiskId === null) {
    // If no editingRiskId, treat as new risk creation (or handle accordingly)
    this.snackBar.open('No risk selected to update action plan.', 'Close', { duration: 3000 });
    return;
  }

  const validActionPlans = (this.actionPlans || [])
  .map(plan => ({
    actionPlan: plan.actionPlan?.trim() || '',
    dueDate: this.datePipe.transform(plan.dueDate, 'yyyy-MM-dd') || '',
    planStatus: plan.planStatus?.trim() || '',
    progress: plan.progress?.trim() || ''
  }))
  .filter(plan => plan.actionPlan && plan.dueDate && plan.planStatus);

const updatedRisk: Risk = {
  ...formValue,
  id: this.editingRiskId,
  riskNumber: this.capturedRisks.find(r => r.id === this.editingRiskId)?.riskNumber || this.generateRiskNumber(),
  capturedDate: this.capturedRisks.find(r => r.id === this.editingRiskId)?.capturedDate || this.formatDate(new Date()),
  actionPlans: validActionPlans
};

  this.riskService.updateRisk(this.editingRiskId, updatedRisk).subscribe({
    next: (risk) => {
      // Update local cache
      const index = this.capturedRisks.findIndex(r => r.id === this.editingRiskId);
      if (index !== -1) {
        this.capturedRisks[index] = risk;
      } else {
        this.capturedRisks.push(risk);
      }

      localStorage.setItem('capturedStrategicRisks', JSON.stringify(this.capturedRisks));

      this.snackBar.open('Action Plan updated successfully!', 'Close', {
        duration: 3000,
        panelClass: ['custom-snackbar-center']
      });

      this.updateForm = false;
      this.showCaptureListActionPlan = true;
      this.loadCapturedRisksActionProgress();
    },
    error: (err) => {
      console.error('Failed to update action plan', err);
      this.snackBar.open('Failed to update action plan.', 'Close', { duration: 3000 });
    }
  });
}


  
 /** called by the template Back button */
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


  loadCapturedRisks() {

    this.riskService.getRisks().subscribe({
  next: risks => console.log('Risks:', risks),
  error: err => console.error('Error loading risks:', err)
});
  this.riskService.getRisks().subscribe({
    next: (risks) => {
 
      // Filter risks based on role
      const filteredRisks = this.currentUser.role === 'SuperAdmin'
        ? risks
        : risks.filter(r => r.ownerId === this.currentUser.id || r.riskOwner === this.currentUser.username);

      this.capturedRisks = filteredRisks;

      this.dataSource = new MatTableDataSource(this.capturedRisks);
      this.dataSource.paginator = this.paginator;

      // Count risks for current year
      const currentYear = new Date().getFullYear();
      const yearRisks = this.capturedRisks.filter(risk => risk.riskNumber?.startsWith(`STR-${currentYear}`));
      this.riskCounter = yearRisks.length;
    },
    error: (err) => {
      console.error('Failed to load risks from backend', err);

    }
  });
}

  loadCapturedRisksActionProgress() {
  this.riskService.getRisks().subscribe({
    next: (risks) => {
      const filteredRisks = this.currentUser.role === 'SuperAdmin'
        ? risks
        : risks.filter(r => r.ownerId === this.currentUser.id || r.riskOwner === this.currentUser.username);

      const progressRisks = filteredRisks.map(r => ({ ...r, status: r.planStatus }));

      console.log('Progress Risks:', progressRisks);
      // this.reportData = progressRisks; // Store raw data for report generation

      this.dataSource1 = new MatTableDataSource(progressRisks);
      this.dataSource1.paginator = this.paginator;
    },
    error: (err) => {
      console.error('Failed to load risks progress from backend', err);

    }
  });
}
  
  applyFilter() {
    const filtered = this.filteredCapturedRisks();
    this.dataSource = new MatTableDataSource(filtered);
    this.dataSource.paginator = this.paginator;
  }
  
  

addNewRisk() {
  this.showForm = true;
  this.updateForm = false;
  this.showCaptureList = false;
  this.isEditing = false;
  this.editingRiskId = null;

  const newId = this.generateRiskNumber();
  const currentDate = this.formatDate(new Date());
// Reset the form for fresh entry
this.riskForm.reset();

  this.riskForm.patchValue({
    riskNumber: newId,
    capturedDate: currentDate
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
    strategicObjective: risk.strategicObjective,
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
    completionDate: risk.completionDate,

    actionPlan: risk.actionPlan,
    dueDate: risk.dueDate,
    progress: risk.progress,
    planStatus: risk.planStatus
    
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
    strategicObjective: risk.strategicObjective,
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




deleteRisk(id: number) {
  this.capturedRisks = this.capturedRisks.filter(r => r.id !== id);
  localStorage.setItem('capturedStrategicRisks', JSON.stringify(this.capturedRisks));
}

deleteProgress(id: number) {
  this.capturedRisks = this.capturedRisks.filter(r => r.id !== id);
  localStorage.setItem('capturedStrategicRisks', JSON.stringify(this.capturedRisks));
}
closeAlert() {
  this.successMessage = null;
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
  const prefix = 'STR';
  const year = new Date().getFullYear();
  this.riskCounter++; // Increase counter

  const number = this.riskCounter.toString().padStart(3, '0'); // e.g., 001, 002
  return `${prefix}-${year}-${number}`;
}

formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-GB', options); // "28 April 2025"
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






downloadReport() {
  if (!this.reportData.length) {
    alert('Please generate the report first.');
    return;
  }

  // build CSV rows
  const rows = [
    ['Risk Number', 'Strategic Objective', 'Plan Status', 'Risk Level'], // header
    ...this.reportData.map(r => [
      r.riskNumber,
      r.strategicObjective,
      r.planStatus,
      r.riskStatus  // or whichever field is your “risk level”
    ])
  ];

  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'Risk_Report.csv');
}


onAddOrUpdate() { 
  if (this.actionPlanForm.invalid) {
    this.actionPlanForm.markAllAsTouched();
    return;
  }

  const actionPlan = this.actionPlanForm.value;

  if (this.isEditing && this.editIndex !== null) {
    // Update existing
    this.actionPlans[this.editIndex] = actionPlan;
    this.isEditing = false;
    this.editIndex = null;
  } else {
    // Add new
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

deleteActionPlan(index: number) {
  this.actionPlans.splice(index, 1);

  // Cancel editing if deleted item was being edited
  if (this.editIndex === index) {
    this.cancelEdit();
  }
}

cancelEdit() {
  this.actionPlanForm.reset();
  this.isEditing = false;
  this.editIndex = null;
}



}
