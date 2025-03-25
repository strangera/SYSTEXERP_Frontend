import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0240Component } from './sys0240.component';

describe('SYS0240Component', () => {
  let component: SYS0240Component;
  let fixture: ComponentFixture<SYS0240Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0240Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0240Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
