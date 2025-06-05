import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24080CRUComponent } from './tls24080-cru.component';

describe('TLS24080CRUComponent', () => {
  let component: TLS24080CRUComponent;
  let fixture: ComponentFixture<TLS24080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
