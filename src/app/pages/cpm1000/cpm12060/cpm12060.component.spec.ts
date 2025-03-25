import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12060Component } from './cpm12060.component';

describe('CPM12060Component', () => {
  let component: CPM12060Component;
  let fixture: ComponentFixture<CPM12060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
