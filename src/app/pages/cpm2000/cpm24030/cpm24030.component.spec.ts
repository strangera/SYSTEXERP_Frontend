import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM24030Component } from './cpm24030.component';

describe('CPM24030Component', () => {
  let component: CPM24030Component;
  let fixture: ComponentFixture<CPM24030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM24030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM24030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
