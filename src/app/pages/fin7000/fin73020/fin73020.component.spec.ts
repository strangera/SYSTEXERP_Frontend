import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN73020Component } from './fin73020.component';

describe('FIN73020Component', () => {
  let component: FIN73020Component;
  let fixture: ComponentFixture<FIN73020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN73020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN73020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
