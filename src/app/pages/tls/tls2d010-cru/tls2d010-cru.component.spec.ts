import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D010CRUComponent } from './tls2d010-cru.component';

describe('TLS2D010CRUComponent', () => {
  let component: TLS2D010CRUComponent;
  let fixture: ComponentFixture<TLS2D010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
