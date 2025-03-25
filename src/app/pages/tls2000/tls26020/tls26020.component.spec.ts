import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26020Component } from './tls26020.component';

describe('TLS26020Component', () => {
  let component: TLS26020Component;
  let fixture: ComponentFixture<TLS26020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
