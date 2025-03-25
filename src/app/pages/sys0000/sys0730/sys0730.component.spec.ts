import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0730Component } from './sys0730.component';

describe('SYS0730Component', () => {
  let component: SYS0730Component;
  let fixture: ComponentFixture<SYS0730Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0730Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0730Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
