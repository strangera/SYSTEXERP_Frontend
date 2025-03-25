import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM25040Component } from './cpm25040.component';

describe('CPM25040Component', () => {
  let component: CPM25040Component;
  let fixture: ComponentFixture<CPM25040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM25040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM25040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
