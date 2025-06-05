import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J010Component } from './tls2j010.component';

describe('TLS2J010Component', () => {
  let component: TLS2J010Component;
  let fixture: ComponentFixture<TLS2J010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
