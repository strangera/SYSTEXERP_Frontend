import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM22030Component } from './cpm22030.component';

describe('CPM22030Component', () => {
  let component: CPM22030Component;
  let fixture: ComponentFixture<CPM22030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM22030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM22030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
