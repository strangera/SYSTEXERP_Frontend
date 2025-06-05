import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12040Component } from './cpm12040.component';

describe('CPM12040Component', () => {
  let component: CPM12040Component;
  let fixture: ComponentFixture<CPM12040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
