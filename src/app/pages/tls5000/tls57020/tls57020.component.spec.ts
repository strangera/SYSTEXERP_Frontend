import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57020Component } from './tls57020.component';

describe('TLS57020Component', () => {
  let component: TLS57020Component;
  let fixture: ComponentFixture<TLS57020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
