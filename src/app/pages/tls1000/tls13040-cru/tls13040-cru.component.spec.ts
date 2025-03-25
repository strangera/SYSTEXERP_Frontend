import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13040CRUComponent } from './tls13040-cru.component';

describe('TLS13040CRUComponent', () => {
  let component: TLS13040CRUComponent;
  let fixture: ComponentFixture<TLS13040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
