import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56010CRUComponent } from './tls56010-cru.component';

describe('TLS56010CRUComponent', () => {
  let component: TLS56010CRUComponent;
  let fixture: ComponentFixture<TLS56010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
