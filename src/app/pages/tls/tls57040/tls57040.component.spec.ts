import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57040Component } from './tls57040.component';

describe('TLS57040Component', () => {
  let component: TLS57040Component;
  let fixture: ComponentFixture<TLS57040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
