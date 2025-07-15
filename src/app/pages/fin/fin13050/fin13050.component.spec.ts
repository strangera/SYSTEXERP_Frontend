import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin13050Component } from './fin13050.component';

describe('Fin13050Component', () => {
  let component: Fin13050Component;
  let fixture: ComponentFixture<Fin13050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin13050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin13050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
