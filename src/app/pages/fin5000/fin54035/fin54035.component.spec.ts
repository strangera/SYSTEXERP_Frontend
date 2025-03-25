import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54035Component } from './fin54035.component';

describe('FIN54035Component', () => {
  let component: FIN54035Component;
  let fixture: ComponentFixture<FIN54035Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54035Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54035Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
