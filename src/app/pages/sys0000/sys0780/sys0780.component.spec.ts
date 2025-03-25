import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0780Component } from './sys0780.component';

describe('SYS0780Component', () => {
  let component: SYS0780Component;
  let fixture: ComponentFixture<SYS0780Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0780Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0780Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
