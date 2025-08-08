import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15060Component } from './fin15060.component';

describe('FIN15060Component', () => {
  let component: FIN15060Component;
  let fixture: ComponentFixture<FIN15060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
