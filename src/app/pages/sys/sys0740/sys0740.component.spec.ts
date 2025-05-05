import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0740Component } from './sys0740.component';

describe('SYS0740Component', () => {
  let component: SYS0740Component;
  let fixture: ComponentFixture<SYS0740Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0740Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0740Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
