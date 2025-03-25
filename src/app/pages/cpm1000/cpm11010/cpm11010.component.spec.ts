import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM11010Component } from './cpm11010.component';

describe('CPM11010Component', () => {
  let component: CPM11010Component;
  let fixture: ComponentFixture<CPM11010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM11010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM11010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
