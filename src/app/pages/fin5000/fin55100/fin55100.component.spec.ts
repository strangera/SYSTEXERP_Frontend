import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55100Component } from './fin55100.component';

describe('FIN55100Component', () => {
  let component: FIN55100Component;
  let fixture: ComponentFixture<FIN55100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
