import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS27040Component } from './tls27040.component';

describe('TLS27040Component', () => {
  let component: TLS27040Component;
  let fixture: ComponentFixture<TLS27040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS27040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS27040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
