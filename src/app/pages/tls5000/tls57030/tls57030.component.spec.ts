import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57030Component } from './tls57030.component';

describe('TLS57030Component', () => {
  let component: TLS57030Component;
  let fixture: ComponentFixture<TLS57030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
