import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin15070Component } from './fin15070.component';

describe('Fin15070Component', () => {
  let component: Fin15070Component;
  let fixture: ComponentFixture<Fin15070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin15070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin15070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
