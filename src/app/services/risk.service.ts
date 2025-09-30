import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environment.prod';

export interface ActionPlan {
  id?: number;
  action: string;
  dueDate: string;
  progress: string;
  planStatus: string;
  riskId?: number;
}

export interface Risk {
  id?: number;
  riskNumber?: string;
  capturedDate?: string;
  strategicObjective?: string;
  riskDescription?: string;
  rootCauses?: string;
  consequences?: string;
  inherentProbability?: number;
  inherentImpact?: number;
  inherentRisk?: number;
  existingControls?: string;
  controlType?: string;
  residualProbability?: number;
  residualImpact?: number;
  residualRisk?: number;
  riskStatus1?: string;
  riskStatus?: string;
  mitigatingPlan?: string;
  riskOwner?: string;
  responsiblePerson?: string;
  completionDate?: string;
  actionPlan?: string;
  dueDate?: string;
  progress?: string;
  planStatus?: string;
  ownerId?: number;
  actionPlans?: any[];
  inherent_risk_rating?: string;
  residual_risk_rating?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RiskService {
  // private baseUrl = 'http://localhost:8001';

  constructor(private http: HttpClient) {}

  // Helper to map snake_case backend to camelCase frontend
 private mapRisk(r: any): Risk {
  return {
    id: r.id,
    riskNumber: r.risk_number,
    capturedDate: r.captured_date,
    strategicObjective: r.strategic_objective,
    riskDescription: r.risk_description,
    rootCauses: r.root_causes,
    consequences: r.consequences,
    inherentProbability: r.inherent_probability,
    inherentImpact: r.inherent_impact,
    inherentRisk: r.inherent_risk,
    existingControls: r.existing_controls,
    controlType: r.control_type,
    residualProbability: r.residual_probability,
    residualImpact: r.residual_impact,
    residualRisk: r.residual_risk,
    riskStatus1: r.risk_status1,
    riskStatus: r.risk_status,
    mitigatingPlan: r.mitigating_plan,
    riskOwner: r.risk_owner,
    responsiblePerson: r.responsible_person,
    completionDate: r.completion_date,
    actionPlan: r.action,
    dueDate: r.due_date,
    progress: r.progress,
    planStatus: r.plan_status,
    ownerId: r.owner_id,
    actionPlans: (r.action_plans || []).map((plan: any) => ({
      id: plan.id,
      actionPlan: plan.action,
      dueDate: plan.due_date,
      progress: plan.progress,
      planStatus: plan.plan_status,
      riskId: plan.risk_id
    })),
    inherent_risk_rating: r.inherent_risk_rating,
    residual_risk_rating: r.residual_risk_rating
  };
}

  // Get all risks
  getRisks(): Observable<Risk[]> {
    return this.http.get<any[]>(`${environment.baseUrl}/api/risks`).pipe(
      map(data => data.map(r => this.mapRisk(r)))
    );
  }

  // Get risk by ID
  getRiskById(id: number): Observable<Risk> {
    return this.http.get<any>(`${environment.baseUrl}/api/risks/${id}`).pipe(
      map(r => this.mapRisk(r))
    );
  }

  // Create a new risk
  createRisk(risk: Risk): Observable<Risk> {
    return this.http.post<Risk>(`${environment.baseUrl}/api/risks`, risk);
  }

  // Update existing risk
  updateRisk(id: number, risk: Risk): Observable<Risk> {
    return this.http.put<Risk>(`${environment.baseUrl}/api/risks/${id}`, risk);
  }

  // Delete risk by ID
  deleteRisk(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.baseUrl}/api/risks/${id}`);
  }

  // Add action plan to a risk
  addActionPlan(riskId: number, actionPlan: ActionPlan): Observable<ActionPlan> {
    return this.http.post<ActionPlan>(`${environment.baseUrl}/api/risks/${riskId}/action_plans`, actionPlan);
  }

  // Update action plan
  updateActionPlan(id: number, actionPlan: ActionPlan): Observable<ActionPlan> {
    return this.http.put<ActionPlan>(`${environment.baseUrl}/api/action_plans/${id}`, actionPlan);
  }

  // Delete action plan
  deleteActionPlan(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.baseUrl}/api/action_plans/${id}`);
  }
}
