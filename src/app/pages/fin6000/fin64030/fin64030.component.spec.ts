import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN64030Component } from './fin64030.component';

describe('FIN64030Component', () => {
  let component: FIN64030Component;
  let fixture: ComponentFixture<FIN64030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN64030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN64030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
