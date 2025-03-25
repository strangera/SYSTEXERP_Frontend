import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS28030Component } from './tls28030.component';

describe('TLS28030Component', () => {
  let component: TLS28030Component;
  let fixture: ComponentFixture<TLS28030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS28030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS28030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
