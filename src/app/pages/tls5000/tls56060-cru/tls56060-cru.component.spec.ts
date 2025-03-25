import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56060CRUComponent } from './tls56060-cru.component';

describe('TLS56060CRUComponent', () => {
  let component: TLS56060CRUComponent;
  let fixture: ComponentFixture<TLS56060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
