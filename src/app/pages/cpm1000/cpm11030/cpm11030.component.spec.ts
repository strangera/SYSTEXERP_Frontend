import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM11030Component } from './cpm11030.component';

describe('CPM11030Component', () => {
  let component: CPM11030Component;
  let fixture: ComponentFixture<CPM11030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM11030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM11030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
