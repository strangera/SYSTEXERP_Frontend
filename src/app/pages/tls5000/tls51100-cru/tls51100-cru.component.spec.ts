import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51100CRUComponent } from './tls51100-cru.component';

describe('TLS51100CRUComponent', () => {
  let component: TLS51100CRUComponent;
  let fixture: ComponentFixture<TLS51100CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51100CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51100CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
