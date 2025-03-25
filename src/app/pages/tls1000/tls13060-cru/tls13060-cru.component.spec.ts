import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13060CRUComponent } from './tls13060-cru.component';

describe('TLS13060CRUComponent', () => {
  let component: TLS13060CRUComponent;
  let fixture: ComponentFixture<TLS13060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
