import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16030Component } from './fin16030.component';

describe('FIN16030Component', () => {
  let component: FIN16030Component;
  let fixture: ComponentFixture<FIN16030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
