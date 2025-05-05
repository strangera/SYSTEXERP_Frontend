import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN61010Component } from './fin61010.component';

describe('FIN61010Component', () => {
  let component: FIN61010Component;
  let fixture: ComponentFixture<FIN61010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN61010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN61010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
