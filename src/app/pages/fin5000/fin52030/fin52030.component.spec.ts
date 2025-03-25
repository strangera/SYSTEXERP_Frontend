import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52030Component } from './fin52030.component';

describe('FIN52030Component', () => {
  let component: FIN52030Component;
  let fixture: ComponentFixture<FIN52030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
