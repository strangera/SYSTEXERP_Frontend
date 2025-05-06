import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM25030Component } from './cpm25030.component';

describe('CPM25030Component', () => {
  let component: CPM25030Component;
  let fixture: ComponentFixture<CPM25030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM25030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM25030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
