import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0210Component } from './sys0210.component';

describe('SYS0210Component', () => {
  let component: SYS0210Component;
  let fixture: ComponentFixture<SYS0210Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0210Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0210Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
