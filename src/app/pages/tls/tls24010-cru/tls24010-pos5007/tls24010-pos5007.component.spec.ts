import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls24010Pos5007Component } from './tls24010-pos5007.component';

describe('Tls24010Pos5007Component', () => {
  let component: Tls24010Pos5007Component;
  let fixture: ComponentFixture<Tls24010Pos5007Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls24010Pos5007Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls24010Pos5007Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
