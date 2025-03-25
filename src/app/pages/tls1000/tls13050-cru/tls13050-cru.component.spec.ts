import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13050CRUComponent } from './tls13050-cru.component';

describe('TLS13050CRUComponent', () => {
  let component: TLS13050CRUComponent;
  let fixture: ComponentFixture<TLS13050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
