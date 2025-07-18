import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls24010Pos5008Component } from './tls24010-pos5008.component';

describe('Tls24010Pos5008Component', () => {
  let component: Tls24010Pos5008Component;
  let fixture: ComponentFixture<Tls24010Pos5008Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls24010Pos5008Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls24010Pos5008Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
