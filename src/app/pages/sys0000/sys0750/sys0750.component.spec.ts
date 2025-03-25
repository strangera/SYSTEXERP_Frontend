import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0750Component } from './sys0750.component';

describe('SYS0750Component', () => {
  let component: SYS0750Component;
  let fixture: ComponentFixture<SYS0750Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0750Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0750Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
