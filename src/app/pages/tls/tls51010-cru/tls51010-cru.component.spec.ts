import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51010CRUComponent } from './tls51010-cru.component';

describe('TLS51010CRUComponent', () => {
  let component: TLS51010CRUComponent;
  let fixture: ComponentFixture<TLS51010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
