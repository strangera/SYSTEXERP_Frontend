import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46060CRUComponent } from './tls46060-cru.component';

describe('TLS46060CRUComponent', () => {
  let component: TLS46060CRUComponent;
  let fixture: ComponentFixture<TLS46060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
