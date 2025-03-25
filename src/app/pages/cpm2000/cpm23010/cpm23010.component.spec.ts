import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM23010Component } from './cpm23010.component';

describe('CPM23010Component', () => {
  let component: CPM23010Component;
  let fixture: ComponentFixture<CPM23010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM23010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM23010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
