import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0320Component } from './sys0320.component';

describe('SYS0320Component', () => {
  let component: SYS0320Component;
  let fixture: ComponentFixture<SYS0320Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0320Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0320Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
