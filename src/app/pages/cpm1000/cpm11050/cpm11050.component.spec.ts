import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM11050Component } from './cpm11050.component';

describe('CPM11050Component', () => {
  let component: CPM11050Component;
  let fixture: ComponentFixture<CPM11050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM11050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM11050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
