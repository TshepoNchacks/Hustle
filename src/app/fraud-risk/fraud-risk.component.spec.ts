import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FraudRiskComponent } from './fraud-risk.component';

describe('FraudRiskComponent', () => {
  let component: FraudRiskComponent;
  let fixture: ComponentFixture<FraudRiskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FraudRiskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FraudRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
