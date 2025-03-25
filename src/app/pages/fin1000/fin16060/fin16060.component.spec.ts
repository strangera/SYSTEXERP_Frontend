import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16060Component } from './fin16060.component';

describe('FIN16060Component', () => {
  let component: FIN16060Component;
  let fixture: ComponentFixture<FIN16060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
