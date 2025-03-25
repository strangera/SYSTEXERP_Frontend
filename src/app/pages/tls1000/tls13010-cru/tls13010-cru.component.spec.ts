import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13010CRUComponent } from './tls13010-cru.component';

describe('TLS13010CRUComponent', () => {
  let component: TLS13010CRUComponent;
  let fixture: ComponentFixture<TLS13010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
