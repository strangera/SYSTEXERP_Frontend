import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26030Component } from './tls26030.component';

describe('TLS26030Component', () => {
  let component: TLS26030Component;
  let fixture: ComponentFixture<TLS26030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
