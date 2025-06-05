import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0791Component } from './sys0791.component';

describe('SYS0791Component', () => {
  let component: SYS0791Component;
  let fixture: ComponentFixture<SYS0791Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0791Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0791Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
