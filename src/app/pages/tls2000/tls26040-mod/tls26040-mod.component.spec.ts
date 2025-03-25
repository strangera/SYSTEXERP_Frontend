import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26040ModComponent } from './tls26040-mod.component';

describe('TLS26040ModComponent', () => {
  let component: TLS26040ModComponent;
  let fixture: ComponentFixture<TLS26040ModComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26040ModComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26040ModComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
