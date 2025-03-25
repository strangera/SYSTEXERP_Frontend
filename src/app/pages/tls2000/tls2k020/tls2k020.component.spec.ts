import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K020Component } from './tls2k020.component';

describe('TLS2K020Component', () => {
  let component: TLS2K020Component;
  let fixture: ComponentFixture<TLS2K020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
