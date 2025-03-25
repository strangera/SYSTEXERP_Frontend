import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM13040Component } from './cpm13040.component';

describe('CPM13040Component', () => {
  let component: CPM13040Component;
  let fixture: ComponentFixture<CPM13040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM13040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM13040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
