import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55060Component } from './fin55060.component';

describe('FIN55060Component', () => {
  let component: FIN55060Component;
  let fixture: ComponentFixture<FIN55060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
