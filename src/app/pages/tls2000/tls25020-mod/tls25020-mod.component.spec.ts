import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS25020ModComponent } from './tls25020-mod.component';

describe('TLS25020ModComponent', () => {
  let component: TLS25020ModComponent;
  let fixture: ComponentFixture<TLS25020ModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS25020ModComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS25020ModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
