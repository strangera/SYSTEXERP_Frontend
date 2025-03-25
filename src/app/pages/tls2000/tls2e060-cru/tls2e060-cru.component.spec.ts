import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E060CRUComponent } from './tls2e060-cru.component';

describe('TLS2E060CRUComponent', () => {
  let component: TLS2E060CRUComponent;
  let fixture: ComponentFixture<TLS2E060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
