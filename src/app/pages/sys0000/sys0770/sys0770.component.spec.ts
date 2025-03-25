import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0770Component } from './sys0770.component';

describe('SYS0770Component', () => {
  let component: SYS0770Component;
  let fixture: ComponentFixture<SYS0770Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0770Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0770Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
