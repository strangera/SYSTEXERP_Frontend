import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN13010Component } from './fin13010.component';

describe('FIN13010Component', () => {
  let component: FIN13010Component;
  let fixture: ComponentFixture<FIN13010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN13010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN13010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
