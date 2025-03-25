import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52050Component } from './fin52050.component';

describe('FIN52050Component', () => {
  let component: FIN52050Component;
  let fixture: ComponentFixture<FIN52050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
