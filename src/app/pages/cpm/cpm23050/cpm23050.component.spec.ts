import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM23050Component } from './cpm23050.component';

describe('CPM23050Component', () => {
  let component: CPM23050Component;
  let fixture: ComponentFixture<CPM23050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM23050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM23050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
