import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS22010Component } from './tls22010.component';

describe('TLS22010Component', () => {
  let component: TLS22010Component;
  let fixture: ComponentFixture<TLS22010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS22010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS22010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
