import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM24010Component } from './cpm24010.component';

describe('CPM24010Component', () => {
  let component: CPM24010Component;
  let fixture: ComponentFixture<CPM24010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM24010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM24010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
