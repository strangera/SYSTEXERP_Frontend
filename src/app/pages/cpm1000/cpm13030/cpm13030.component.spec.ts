import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM13030Component } from './cpm13030.component';

describe('CPM13030Component', () => {
  let component: CPM13030Component;
  let fixture: ComponentFixture<CPM13030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM13030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM13030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
