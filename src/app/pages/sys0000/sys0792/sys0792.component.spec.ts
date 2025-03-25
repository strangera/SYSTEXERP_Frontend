import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0792Component } from './sys0792.component';

describe('SYS0792Component', () => {
  let component: SYS0792Component;
  let fixture: ComponentFixture<SYS0792Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0792Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0792Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
