import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24040Component } from './tls24040.component';

describe('TLS24040Component', () => {
  let component: TLS24040Component;
  let fixture: ComponentFixture<TLS24040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
