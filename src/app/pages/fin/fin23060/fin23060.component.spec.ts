import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23060Component } from './fin23060.component';

describe('FIN23060Component', () => {
  let component: FIN23060Component;
  let fixture: ComponentFixture<FIN23060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
