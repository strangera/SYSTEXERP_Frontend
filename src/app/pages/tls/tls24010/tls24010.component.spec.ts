import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24010Component } from './tls24010.component';

describe('TLS24010Component', () => {
  let component: TLS24010Component;
  let fixture: ComponentFixture<TLS24010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
