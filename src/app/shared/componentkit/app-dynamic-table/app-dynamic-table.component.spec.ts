import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDynamicTableComponent } from './app-dynamic-table.component';

describe('AppDynamicTableComponent', () => {
  let component: AppDynamicTableComponent;
  let fixture: ComponentFixture<AppDynamicTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDynamicTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDynamicTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
