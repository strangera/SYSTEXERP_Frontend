import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2K060CRUComponent } from './tls2k060-cru.component';

describe('TLS2K060CRUComponent', () => {
  let component: TLS2K060CRUComponent;
  let fixture: ComponentFixture<TLS2K060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2K060CRUComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TLS2K060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
