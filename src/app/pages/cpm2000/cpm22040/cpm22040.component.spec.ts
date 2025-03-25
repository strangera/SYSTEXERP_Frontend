import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM22040Component } from './cpm22040.component';

describe('CPM22040Component', () => {
  let component: CPM22040Component;
  let fixture: ComponentFixture<CPM22040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM22040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM22040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
