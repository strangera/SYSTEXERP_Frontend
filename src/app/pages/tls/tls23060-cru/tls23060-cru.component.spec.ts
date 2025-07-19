import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23060CRUComponent } from './tls23060-cru.component';

describe('Tls23060CruComponent', () => {
  let component: TLS23060CRUComponent;
  let fixture: ComponentFixture<TLS23060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
