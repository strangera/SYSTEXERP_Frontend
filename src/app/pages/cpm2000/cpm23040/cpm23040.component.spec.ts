import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM23040Component } from './cpm23040.component';

describe('CPM23040Component', () => {
  let component: CPM23040Component;
  let fixture: ComponentFixture<CPM23040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM23040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM23040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
