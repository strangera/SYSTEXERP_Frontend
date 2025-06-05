import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D050CRUComponent } from './tls2d050-cru.component';

describe('TLS2D050CRUComponent', () => {
  let component: TLS2D050CRUComponent;
  let fixture: ComponentFixture<TLS2D050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
