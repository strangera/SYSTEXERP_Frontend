import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0310Component } from './sys0310.component';

describe('SYS0310Component', () => {
  let component: SYS0310Component;
  let fixture: ComponentFixture<SYS0310Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0310Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0310Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
