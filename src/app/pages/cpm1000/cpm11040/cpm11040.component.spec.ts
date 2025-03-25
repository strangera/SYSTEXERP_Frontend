import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM11040Component } from './cpm11040.component';

describe('CPM11040Component', () => {
  let component: CPM11040Component;
  let fixture: ComponentFixture<CPM11040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM11040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM11040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
