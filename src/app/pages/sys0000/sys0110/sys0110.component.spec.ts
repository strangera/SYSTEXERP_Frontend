import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0110Component } from './sys0110.component';

describe('SYS0110Component', () => {
  let component: SYS0110Component;
  let fixture: ComponentFixture<SYS0110Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0110Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0110Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
