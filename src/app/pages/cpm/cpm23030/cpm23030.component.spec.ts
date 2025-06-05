import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM23030Component } from './cpm23030.component';

describe('CPM23030Component', () => {
  let component: CPM23030Component;
  let fixture: ComponentFixture<CPM23030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM23030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM23030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
