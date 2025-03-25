import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35010Component } from './fin35010.component';

describe('FIN35010Component', () => {
  let component: FIN35010Component;
  let fixture: ComponentFixture<FIN35010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
