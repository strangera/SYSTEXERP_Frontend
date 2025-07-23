import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26050Component } from './tls26050.component';

describe('TLS26050Component', () => {
  let component: TLS26050Component;
  let fixture: ComponentFixture<TLS26050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
