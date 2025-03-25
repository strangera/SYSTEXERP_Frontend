import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56050CRUComponent } from './tls56050-cru.component';

describe('TLS56050CRUComponent', () => {
  let component: TLS56050CRUComponent;
  let fixture: ComponentFixture<TLS56050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
