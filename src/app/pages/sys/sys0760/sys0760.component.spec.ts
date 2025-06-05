import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0760Component } from './sys0760.component';

describe('SYS0760Component', () => {
  let component: SYS0760Component;
  let fixture: ComponentFixture<SYS0760Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0760Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0760Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
