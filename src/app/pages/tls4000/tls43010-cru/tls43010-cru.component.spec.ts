import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS43010CRUComponent } from './tls43010-cru.component';

describe('TLS43010CRUComponent', () => {
  let component: TLS43010CRUComponent;
  let fixture: ComponentFixture<TLS43010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS43010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS43010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
