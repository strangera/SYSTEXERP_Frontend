import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM11060Component } from './cpm11060.component';

describe('CPM11060Component', () => {
  let component: CPM11060Component;
  let fixture: ComponentFixture<CPM11060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM11060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM11060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
