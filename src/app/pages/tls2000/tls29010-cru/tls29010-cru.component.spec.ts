import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS29010CRUComponent } from './tls29010-cru.component';

describe('TLS29010CRUComponent', () => {
  let component: TLS29010CRUComponent;
  let fixture: ComponentFixture<TLS29010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS29010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS29010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
