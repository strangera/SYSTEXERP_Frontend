import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16100Component } from './fin16100.component';

describe('FIN16100Component', () => {
  let component: FIN16100Component;
  let fixture: ComponentFixture<FIN16100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
