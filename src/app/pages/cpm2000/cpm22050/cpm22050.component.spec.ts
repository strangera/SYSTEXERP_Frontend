import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM22050Component } from './cpm22050.component';

describe('CPM22050Component', () => {
  let component: CPM22050Component;
  let fixture: ComponentFixture<CPM22050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM22050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM22050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
