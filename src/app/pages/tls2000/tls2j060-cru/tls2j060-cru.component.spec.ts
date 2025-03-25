import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J060CRUComponent } from './tls2j060-cru.component';

describe('TLS2J060CRUComponent', () => {
  let component: TLS2J060CRUComponent;
  let fixture: ComponentFixture<TLS2J060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
