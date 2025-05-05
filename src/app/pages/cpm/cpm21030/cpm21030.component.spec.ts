import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21030Component } from './cpm21030.component';

describe('CPM21030Component', () => {
  let component: CPM21030Component;
  let fixture: ComponentFixture<CPM21030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
