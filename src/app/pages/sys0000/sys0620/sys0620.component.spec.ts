import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0620Component } from './sys0620.component';

describe('SYS0620Component', () => {
  let component: SYS0620Component;
  let fixture: ComponentFixture<SYS0620Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0620Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0620Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
