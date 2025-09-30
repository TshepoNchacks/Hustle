import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ComplianceRiskProfileComponent } from './compliance-risk-profile/compliance-risk-profile.component';
import { StrategicRiskComponent } from './strategic-risk/strategic-risk.component';
import { OperationalRiskComponent } from './operational-risk/operational-risk.component';

const routes: Routes = [
  { path: 'login',  component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'compliance-risk-profile', component: ComplianceRiskProfileComponent },
  { path: 'home', component: DashboardComponent },
  { path: 'strategicRisk', component: StrategicRiskComponent },
  { path: 'operationalRisk', component: OperationalRiskComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],  // Always use RouterModule.forRoot for the main routing module
  exports: [RouterModule]
})
export class AppRoutingModule { }
