import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56040Component } from './tls56040.component';

describe('TLS56040Component', () => {
  let component: TLS56040Component;
  let fixture: ComponentFixture<TLS56040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
