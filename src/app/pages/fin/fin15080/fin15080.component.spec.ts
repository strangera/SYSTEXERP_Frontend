import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin15080Component } from './fin15080.component';

describe('Fin15080Component', () => {
  let component: Fin15080Component;
  let fixture: ComponentFixture<Fin15080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin15080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin15080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
