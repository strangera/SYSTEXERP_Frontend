import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21010Component } from './cpm21010.component';

describe('CPM21010Component', () => {
  let component: CPM21010Component;
  let fixture: ComponentFixture<CPM21010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
