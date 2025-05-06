import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM22020Component } from './cpm22020.component';

describe('CPM22020Component', () => {
  let component: CPM22020Component;
  let fixture: ComponentFixture<CPM22020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM22020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM22020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
