import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63060Component } from './fin63060.component';

describe('FIN63060Component', () => {
  let component: FIN63060Component;
  let fixture: ComponentFixture<FIN63060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
