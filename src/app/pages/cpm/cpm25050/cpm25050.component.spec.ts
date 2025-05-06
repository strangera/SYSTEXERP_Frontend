import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM25050Component } from './cpm25050.component';

describe('CPM25050Component', () => {
  let component: CPM25050Component;
  let fixture: ComponentFixture<CPM25050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM25050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM25050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
