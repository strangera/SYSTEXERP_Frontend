import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24010CRUComponent } from './tls24010-cru.component';

describe('TLS24010CRUComponent', () => {
  let component: TLS24010CRUComponent;
  let fixture: ComponentFixture<TLS24010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
