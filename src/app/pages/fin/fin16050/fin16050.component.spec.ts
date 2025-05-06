import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16050Component } from './fin16050.component';

describe('FIN16050Component', () => {
  let component: FIN16050Component;
  let fixture: ComponentFixture<FIN16050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
