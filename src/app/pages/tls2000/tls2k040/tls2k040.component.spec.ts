import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K040Component } from './tls2k040.component';

describe('TLS2K040Component', () => {
  let component: TLS2K040Component;
  let fixture: ComponentFixture<TLS2K040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2K040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
