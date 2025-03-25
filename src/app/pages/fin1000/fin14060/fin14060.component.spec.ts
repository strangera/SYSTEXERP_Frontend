import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14060Component } from './fin14060.component';

describe('FIN14060Component', () => {
  let component: FIN14060Component;
  let fixture: ComponentFixture<FIN14060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
