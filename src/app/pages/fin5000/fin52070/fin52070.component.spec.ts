import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52070Component } from './fin52070.component';

describe('FIN52070Component', () => {
  let component: FIN52070Component;
  let fixture: ComponentFixture<FIN52070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
