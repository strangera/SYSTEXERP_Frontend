import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51030Component } from './fin51030.component';

describe('FIN51030Component', () => {
  let component: FIN51030Component;
  let fixture: ComponentFixture<FIN51030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
