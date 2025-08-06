import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin15090Component } from './fin15090.component';

describe('Fin15090Component', () => {
  let component: Fin15090Component;
  let fixture: ComponentFixture<Fin15090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin15090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin15090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
