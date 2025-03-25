import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0230Component } from './sys0230.component';

describe('SYS0230Component', () => {
  let component: SYS0230Component;
  let fixture: ComponentFixture<SYS0230Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0230Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0230Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
