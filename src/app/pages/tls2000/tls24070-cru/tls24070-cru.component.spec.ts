import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24070CRUComponent } from './tls24070-cru.component';

describe('TLS24070CRUComponent', () => {
  let component: TLS24070CRUComponent;
  let fixture: ComponentFixture<TLS24070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
