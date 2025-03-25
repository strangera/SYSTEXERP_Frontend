import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM22010Component } from './cpm22010.component';

describe('CPM22010Component', () => {
  let component: CPM22010Component;
  let fixture: ComponentFixture<CPM22010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM22010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM22010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
