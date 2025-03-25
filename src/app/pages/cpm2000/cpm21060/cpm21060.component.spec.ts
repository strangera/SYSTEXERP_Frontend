import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21060Component } from './cpm21060.component';

describe('CPM21060Component', () => {
  let component: CPM21060Component;
  let fixture: ComponentFixture<CPM21060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
