import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN53010Component } from './fin53010.component';

describe('FIN53010Component', () => {
  let component: FIN53010Component;
  let fixture: ComponentFixture<FIN53010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN53010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN53010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
