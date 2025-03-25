import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24010ModComponent } from './tls24010-mod.component';

describe('TLS24010ModComponent', () => {
  let component: TLS24010ModComponent;
  let fixture: ComponentFixture<TLS24010ModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24010ModComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24010ModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
