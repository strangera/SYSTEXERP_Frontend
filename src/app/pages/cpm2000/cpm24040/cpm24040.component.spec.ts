import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM24040Component } from './cpm24040.component';

describe('CPM24040Component', () => {
  let component: CPM24040Component;
  let fixture: ComponentFixture<CPM24040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM24040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM24040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
