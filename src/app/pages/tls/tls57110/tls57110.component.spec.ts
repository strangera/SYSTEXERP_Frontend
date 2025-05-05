import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57110Component } from './tls57110.component';

describe('TLS57110Component', () => {
  let component: TLS57110Component;
  let fixture: ComponentFixture<TLS57110Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57110Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57110Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
