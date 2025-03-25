import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26040Component } from './tls26040.component';

describe('TLS26040Component', () => {
  let component: TLS26040Component;
  let fixture: ComponentFixture<TLS26040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
