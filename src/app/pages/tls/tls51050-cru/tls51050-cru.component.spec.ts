import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51050CRUComponent } from './tls51050-cru.component';

describe('TLS51050CRUComponent', () => {
  let component: TLS51050CRUComponent;
  let fixture: ComponentFixture<TLS51050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
