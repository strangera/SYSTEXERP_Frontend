import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fin11210Component } from './fin11210.component';

describe('Fin11210Component', () => {
  let component: Fin11210Component;
  let fixture: ComponentFixture<Fin11210Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fin11210Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fin11210Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
