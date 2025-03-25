import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM13020Component } from './cpm13020.component';

describe('CPM13020Component', () => {
  let component: CPM13020Component;
  let fixture: ComponentFixture<CPM13020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM13020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM13020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
