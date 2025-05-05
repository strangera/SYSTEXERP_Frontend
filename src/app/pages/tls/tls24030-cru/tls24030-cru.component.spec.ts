import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24030CRUComponent } from './tls24030-cru.component';

describe('TLS24030CRUComponent', () => {
  let component: TLS24030CRUComponent;
  let fixture: ComponentFixture<TLS24030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
