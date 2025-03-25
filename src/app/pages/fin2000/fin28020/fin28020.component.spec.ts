import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN28020Component } from './fin28020.component';

describe('FIN28020Component', () => {
  let component: FIN28020Component;
  let fixture: ComponentFixture<FIN28020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN28020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN28020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
