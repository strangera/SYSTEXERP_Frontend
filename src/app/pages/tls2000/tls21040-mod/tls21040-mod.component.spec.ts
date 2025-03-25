import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21040ModComponent } from './tls21040-mod.component';

describe('TLS21040ModComponent', () => {
  let component: TLS21040ModComponent;
  let fixture: ComponentFixture<TLS21040ModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21040ModComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21040ModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
