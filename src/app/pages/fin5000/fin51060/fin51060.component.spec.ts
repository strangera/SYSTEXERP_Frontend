import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51060Component } from './fin51060.component';

describe('FIN51060Component', () => {
  let component: FIN51060Component;
  let fixture: ComponentFixture<FIN51060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
