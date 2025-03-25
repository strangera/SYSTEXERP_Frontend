import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN12010Component } from './fin12010.component';

describe('FIN12010Component', () => {
  let component: FIN12010Component;
  let fixture: ComponentFixture<FIN12010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN12010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN12010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
