import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM13010Component } from './cpm13010.component';

describe('CPM13010Component', () => {
  let component: CPM13010Component;
  let fixture: ComponentFixture<CPM13010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM13010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM13010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
