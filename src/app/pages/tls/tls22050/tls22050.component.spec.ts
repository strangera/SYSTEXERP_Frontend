import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls22050Component } from './tls22050.component';

describe('Tls22050Component', () => {
  let component: Tls22050Component;
  let fixture: ComponentFixture<Tls22050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls22050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls22050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
