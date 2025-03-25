import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51080CRUComponent } from './tls51080-cru.component';

describe('TLS51080CRUComponent', () => {
  let component: TLS51080CRUComponent;
  let fixture: ComponentFixture<TLS51080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
