import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52010Component } from './fin52010.component';

describe('FIN52010Component', () => {
  let component: FIN52010Component;
  let fixture: ComponentFixture<FIN52010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
