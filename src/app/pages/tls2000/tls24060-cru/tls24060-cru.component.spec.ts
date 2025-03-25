import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24060CRUComponent } from './tls24060-cru.component';

describe('TLS24060CRUComponent', () => {
  let component: TLS24060CRUComponent;
  let fixture: ComponentFixture<TLS24060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
