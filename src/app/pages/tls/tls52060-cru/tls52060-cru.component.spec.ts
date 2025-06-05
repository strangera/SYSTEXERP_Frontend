import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52060CRUComponent } from './tls52060-cru.component';

describe('TLS52060CRUComponent', () => {
  let component: TLS52060CRUComponent;
  let fixture: ComponentFixture<TLS52060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
