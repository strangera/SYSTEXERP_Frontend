import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12010Component } from './cpm12010.component';

describe('CPM12010Component', () => {
  let component: CPM12010Component;
  let fixture: ComponentFixture<CPM12010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
