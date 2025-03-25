import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM13050Component } from './cpm13050.component';

describe('CPM13050Component', () => {
  let component: CPM13050Component;
  let fixture: ComponentFixture<CPM13050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM13050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM13050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
