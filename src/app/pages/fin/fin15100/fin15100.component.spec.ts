import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin15100Component } from './fin15100.component';

describe('Fin15100Component', () => {
  let component: Fin15100Component;
  let fixture: ComponentFixture<Fin15100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin15100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin15100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
