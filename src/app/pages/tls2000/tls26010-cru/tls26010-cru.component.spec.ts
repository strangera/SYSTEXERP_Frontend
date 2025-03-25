import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26010CRUComponent } from './tls26010-cru.component';

describe('TLS26010CRUComponent', () => {
  let component: TLS26010CRUComponent;
  let fixture: ComponentFixture<TLS26010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
