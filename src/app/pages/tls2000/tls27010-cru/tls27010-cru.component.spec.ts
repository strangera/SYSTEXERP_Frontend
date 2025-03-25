import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS27010CRUComponent } from './tls27010-cru.component';

describe('TLS27010CRUComponent', () => {
  let component: TLS27010CRUComponent;
  let fixture: ComponentFixture<TLS27010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS27010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS27010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
