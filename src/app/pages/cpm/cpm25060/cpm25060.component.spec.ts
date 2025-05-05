import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM25060Component } from './cpm25060.component';

describe('CPM25060Component', () => {
  let component: CPM25060Component;
  let fixture: ComponentFixture<CPM25060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM25060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM25060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
