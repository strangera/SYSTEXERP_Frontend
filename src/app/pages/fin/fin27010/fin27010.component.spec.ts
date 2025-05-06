import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN27010Component } from './fin27010.component';

describe('FIN27010Component', () => {
  let component: FIN27010Component;
  let fixture: ComponentFixture<FIN27010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN27010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN27010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
