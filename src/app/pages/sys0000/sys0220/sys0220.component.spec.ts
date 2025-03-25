import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0220Component } from './sys0220.component';

describe('SYS0220Component', () => {
  let component: SYS0220Component;
  let fixture: ComponentFixture<SYS0220Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0220Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0220Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
