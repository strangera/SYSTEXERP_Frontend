import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12050Component } from './cpm12050.component';

describe('CPM12050Component', () => {
  let component: CPM12050Component;
  let fixture: ComponentFixture<CPM12050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
