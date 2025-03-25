import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0790Component } from './sys0790.component';

describe('SYS0790Component', () => {
  let component: SYS0790Component;
  let fixture: ComponentFixture<SYS0790Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0790Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0790Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
