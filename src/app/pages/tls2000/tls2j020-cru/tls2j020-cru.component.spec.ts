import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J020CRUComponent } from './tls2j020-cru.component';

describe('TLS2J020CRUComponent', () => {
  let component: TLS2J020CRUComponent;
  let fixture: ComponentFixture<TLS2J020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
