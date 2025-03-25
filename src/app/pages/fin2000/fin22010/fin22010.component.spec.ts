import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN22010Component } from './fin22010.component';

describe('FIN22010Component', () => {
  let component: FIN22010Component;
  let fixture: ComponentFixture<FIN22010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN22010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN22010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
