import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM25020Component } from './cpm25020.component';

describe('CPM25020Component', () => {
  let component: CPM25020Component;
  let fixture: ComponentFixture<CPM25020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM25020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM25020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
