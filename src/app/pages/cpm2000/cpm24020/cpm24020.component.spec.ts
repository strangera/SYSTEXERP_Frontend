import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM24020Component } from './cpm24020.component';

describe('CPM24020Component', () => {
  let component: CPM24020Component;
  let fixture: ComponentFixture<CPM24020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM24020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM24020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
