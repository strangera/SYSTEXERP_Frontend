import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51020Component } from './fin51020.component';

describe('FIN51020Component', () => {
  let component: FIN51020Component;
  let fixture: ComponentFixture<FIN51020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
