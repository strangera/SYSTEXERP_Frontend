import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN27020Component } from './fin27020.component';

describe('FIN27020Component', () => {
  let component: FIN27020Component;
  let fixture: ComponentFixture<FIN27020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN27020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN27020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
