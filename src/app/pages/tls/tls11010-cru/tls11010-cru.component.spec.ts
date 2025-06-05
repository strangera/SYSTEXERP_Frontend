import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS11010CRUComponent } from './tls11010-cru.component';

describe('TLS11010CRUComponent', () => {
  let component: TLS11010CRUComponent;
  let fixture: ComponentFixture<TLS11010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS11010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS11010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
