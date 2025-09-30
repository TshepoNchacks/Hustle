import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrategicRiskComponent } from './strategic-risk.component';

describe('StrategicRiskComponent', () => {
  let component: StrategicRiskComponent;
  let fixture: ComponentFixture<StrategicRiskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StrategicRiskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StrategicRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
