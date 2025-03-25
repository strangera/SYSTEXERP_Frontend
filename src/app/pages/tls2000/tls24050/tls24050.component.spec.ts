import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24050Component } from './tls24050.component';

describe('TLS24050Component', () => {
  let component: TLS24050Component;
  let fixture: ComponentFixture<TLS24050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
