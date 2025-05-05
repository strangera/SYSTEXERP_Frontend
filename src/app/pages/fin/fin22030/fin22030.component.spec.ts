import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN22030Component } from './fin22030.component';

describe('FIN22030Component', () => {
  let component: FIN22030Component;
  let fixture: ComponentFixture<FIN22030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN22030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN22030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
