import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35060Component } from './fin35060.component';

describe('FIN35060Component', () => {
  let component: FIN35060Component;
  let fixture: ComponentFixture<FIN35060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
