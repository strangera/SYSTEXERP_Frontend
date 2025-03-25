import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0710Component } from './sys0710.component';

describe('SYS0710Component', () => {
  let component: SYS0710Component;
  let fixture: ComponentFixture<SYS0710Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0710Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0710Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
