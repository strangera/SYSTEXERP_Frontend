import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46040Component } from './tls46040.component';

describe('TLS46040Component', () => {
  let component: TLS46040Component;
  let fixture: ComponentFixture<TLS46040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
