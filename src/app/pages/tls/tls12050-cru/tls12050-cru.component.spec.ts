import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12050CRUComponent } from './tls12050-cru.component';

describe('TLS12050CRUComponent', () => {
  let component: TLS12050CRUComponent;
  let fixture: ComponentFixture<TLS12050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
