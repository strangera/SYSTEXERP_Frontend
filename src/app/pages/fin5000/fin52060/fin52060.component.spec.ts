import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52060Component } from './fin52060.component';

describe('FIN52060Component', () => {
  let component: FIN52060Component;
  let fixture: ComponentFixture<FIN52060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
