import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35070Component } from './fin35070.component';

describe('FIN35070Component', () => {
  let component: FIN35070Component;
  let fixture: ComponentFixture<FIN35070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
