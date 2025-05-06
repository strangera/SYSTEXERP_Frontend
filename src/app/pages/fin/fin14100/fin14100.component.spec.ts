import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14100Component } from './fin14100.component';

describe('FIN14100Component', () => {
  let component: FIN14100Component;
  let fixture: ComponentFixture<FIN14100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
