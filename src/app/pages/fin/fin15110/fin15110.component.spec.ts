import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15100Component } from './fin15110.component';

describe('FIN15100Component', () => {
  let component: FIN15100Component;
  let fixture: ComponentFixture<FIN15100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
