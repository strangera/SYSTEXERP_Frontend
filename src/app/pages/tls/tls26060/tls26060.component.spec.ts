import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26060Component } from './tls26060.component';

describe('TLS26060Component', () => {
  let component: TLS26060Component;
  let fixture: ComponentFixture<TLS26060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
