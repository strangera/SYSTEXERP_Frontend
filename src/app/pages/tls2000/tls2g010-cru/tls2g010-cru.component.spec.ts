import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2G010CRUComponent } from './tls2g010-cru.component';

describe('TLS2G010CRUComponent', () => {
  let component: TLS2G010CRUComponent;
  let fixture: ComponentFixture<TLS2G010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2G010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2G010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
