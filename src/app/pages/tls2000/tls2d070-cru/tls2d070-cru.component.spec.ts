import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D070CRUComponent } from './tls2d070-cru.component';

describe('TLS2D070CRUComponent', () => {
  let component: TLS2D070CRUComponent;
  let fixture: ComponentFixture<TLS2D070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
