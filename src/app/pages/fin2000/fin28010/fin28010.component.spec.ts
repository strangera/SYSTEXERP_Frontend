import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN28010Component } from './fin28010.component';

describe('FIN28010Component', () => {
  let component: FIN28010Component;
  let fixture: ComponentFixture<FIN28010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN28010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN28010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
