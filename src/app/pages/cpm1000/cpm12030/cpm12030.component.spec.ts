import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM12030Component } from './cpm12030.component';

describe('CPM12030Component', () => {
  let component: CPM12030Component;
  let fixture: ComponentFixture<CPM12030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM12030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM12030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
