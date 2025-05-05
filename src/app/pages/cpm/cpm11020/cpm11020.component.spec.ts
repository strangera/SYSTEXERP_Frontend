import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM11020Component } from './cpm11020.component';

describe('CPM11020Component', () => {
  let component: CPM11020Component;
  let fixture: ComponentFixture<CPM11020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM11020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM11020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
