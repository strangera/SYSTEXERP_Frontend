import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51040Component } from './fin51040.component';

describe('FIN51040Component', () => {
  let component: FIN51040Component;
  let fixture: ComponentFixture<FIN51040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
