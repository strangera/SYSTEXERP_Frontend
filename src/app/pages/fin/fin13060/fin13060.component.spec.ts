import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN13060Component } from './fin13060.component';

describe('Fin13060Component', () => {
  let component: FIN13060Component;
  let fixture: ComponentFixture<FIN13060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN13060Component]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FIN13060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
