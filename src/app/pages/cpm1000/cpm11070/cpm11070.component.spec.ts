import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM11070Component } from './cpm11070.component';

describe('CPM11070Component', () => {
  let component: CPM11070Component;
  let fixture: ComponentFixture<CPM11070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM11070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM11070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
