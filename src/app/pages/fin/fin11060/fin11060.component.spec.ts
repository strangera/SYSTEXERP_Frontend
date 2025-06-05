import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11060Component } from './fin11060.component';

describe('FIN11060Component', () => {
  let component: FIN11060Component;
  let fixture: ComponentFixture<FIN11060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
