import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21050Component } from './cpm21050.component';

describe('CPM21050Component', () => {
  let component: CPM21050Component;
  let fixture: ComponentFixture<CPM21050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
