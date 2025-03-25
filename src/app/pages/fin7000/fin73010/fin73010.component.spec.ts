import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN73010Component } from './fin73010.component';

describe('FIN73010Component', () => {
  let component: FIN73010Component;
  let fixture: ComponentFixture<FIN73010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN73010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN73010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
