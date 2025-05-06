import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM23020Component } from './cpm23020.component';

describe('CPM23020Component', () => {
  let component: CPM23020Component;
  let fixture: ComponentFixture<CPM23020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM23020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM23020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
