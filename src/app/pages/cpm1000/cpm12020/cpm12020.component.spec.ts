import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12020Component } from './cpm12020.component';

describe('CPM12020Component', () => {
  let component: CPM12020Component;
  let fixture: ComponentFixture<CPM12020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
