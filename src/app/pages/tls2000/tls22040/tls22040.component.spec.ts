import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS22040Component } from './tls22040.component';

describe('TLS22040Component', () => {
  let component: TLS22040Component;
  let fixture: ComponentFixture<TLS22040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS22040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS22040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
