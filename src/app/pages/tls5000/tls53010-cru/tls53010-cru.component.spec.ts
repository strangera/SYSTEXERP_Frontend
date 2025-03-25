import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS53010CRUComponent } from './tls53010-cru.component';

describe('TLS53010CRUComponent', () => {
  let component: TLS53010CRUComponent;
  let fixture: ComponentFixture<TLS53010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS53010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS53010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
