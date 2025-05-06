import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN72010Component } from './fin72010.component';

describe('FIN72010Component', () => {
  let component: FIN72010Component;
  let fixture: ComponentFixture<FIN72010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN72010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN72010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
