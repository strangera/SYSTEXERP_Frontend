import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12070Component } from './cpm12070.component';

describe('CPM12070Component', () => {
  let component: CPM12070Component;
  let fixture: ComponentFixture<CPM12070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
