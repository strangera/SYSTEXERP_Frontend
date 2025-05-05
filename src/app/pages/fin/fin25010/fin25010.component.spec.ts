import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN25010Component } from './fin25010.component';

describe('FIN25010Component', () => {
  let component: FIN25010Component;
  let fixture: ComponentFixture<FIN25010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN25010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN25010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
