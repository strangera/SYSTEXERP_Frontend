import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21040Component } from './cpm21040.component';

describe('CPM21040Component', () => {
  let component: CPM21040Component;
  let fixture: ComponentFixture<CPM21040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
