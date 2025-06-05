import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55060CRUComponent } from './tls55060-cru.component';

describe('TLS55060CRUComponent', () => {
  let component: TLS55060CRUComponent;
  let fixture: ComponentFixture<TLS55060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
