import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS42010Component } from './tls42010.component';

describe('TLS42010Component', () => {
  let component: TLS42010Component;
  let fixture: ComponentFixture<TLS42010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS42010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS42010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
