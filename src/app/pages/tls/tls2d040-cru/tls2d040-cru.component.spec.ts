import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D040CRUComponent } from './tls2d040-cru.component';

describe('TLS2D040CRUComponent', () => {
  let component: TLS2D040CRUComponent;
  let fixture: ComponentFixture<TLS2D040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
