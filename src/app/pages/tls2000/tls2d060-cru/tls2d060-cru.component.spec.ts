import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D060CRUComponent } from './tls2d060-cru.component';

describe('TLS2D060CRUComponent', () => {
  let component: TLS2D060CRUComponent;
  let fixture: ComponentFixture<TLS2D060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
