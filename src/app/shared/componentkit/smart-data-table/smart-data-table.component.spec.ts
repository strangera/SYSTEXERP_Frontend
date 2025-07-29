import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartDataTableComponent } from './smart-data-table.component';

describe('SmartDataTableComponent', () => {
  let component: SmartDataTableComponent;
  let fixture: ComponentFixture<SmartDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartDataTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmartDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
