import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13020CRUComponent } from './tls13020-cru.component';

describe('TLS13020CRUComponent', () => {
  let component: TLS13020CRUComponent;
  let fixture: ComponentFixture<TLS13020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
