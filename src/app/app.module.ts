import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  
import { AppRoutingModule } from './app-routing.module';  // Ensure this import is present
import { AppComponent } from './app.component';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComplianceRiskProfileComponent } from './compliance-risk-profile/compliance-risk-profile.component';
import { StrategicRiskComponent } from './strategic-risk/strategic-risk.component';
import { RiskService } from './services/risk.service';
import { InternalAuditComponent } from "./internal-audit/internal-audit.component";
import { ExternalAuditComponent } from "./external-audit/external-audit.component";
import { FraudRiskComponent } from './fraud-risk/fraud-risk.component';
import { ProjectRiskComponent } from './project-risk/project-risk.component';
import { ComplianceRiskPlanComponent } from './compliance-risk-plan/compliance-risk-plan.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { UserManagementComponent } from './user-management/user-management.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';   
import { DatePipe } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { OperationalRiskComponent } from './operational-risk/operational-risk.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({ declarations: [
        AppComponent,
        RegistrationComponent,
        LoginComponent,
        DashboardComponent,
        ComplianceRiskProfileComponent,
        StrategicRiskComponent,
        FraudRiskComponent,
        ProjectRiskComponent,
        ComplianceRiskPlanComponent,
        InternalAuditComponent,
        ExternalAuditComponent,
        UserManagementComponent,
        OperationalRiskComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule, // Ensure this is present here
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        MatTableModule,
        MatPaginatorModule,
        MatPaginatorModule,
        MatIconModule,
        NgChartsModule,
         MatProgressBarModule,
    ], providers: [RiskService, provideAnimationsAsync(), DatePipe, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
