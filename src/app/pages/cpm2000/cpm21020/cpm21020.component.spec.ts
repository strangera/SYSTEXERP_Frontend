import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21020Component } from './cpm21020.component';

describe('CPM21020Component', () => {
  let component: CPM21020Component;
  let fixture: ComponentFixture<CPM21020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
