import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM25010Component } from './cpm25010.component';

describe('CPM25010Component', () => {
  let component: CPM25010Component;
  let fixture: ComponentFixture<CPM25010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM25010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM25010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
