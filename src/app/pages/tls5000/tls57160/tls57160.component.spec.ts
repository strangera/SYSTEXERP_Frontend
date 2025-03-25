import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57160Component } from './tls57160.component';

describe('TLS57160Component', () => {
  let component: TLS57160Component;
  let fixture: ComponentFixture<TLS57160Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57160Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57160Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
