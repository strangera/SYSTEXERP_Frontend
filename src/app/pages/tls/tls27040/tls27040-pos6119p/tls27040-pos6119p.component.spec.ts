import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls27040POS6119pComponent } from './tls27040-pos6119p.component';

describe('Tls27040POS6119pComponent', () => {
  let component: Tls27040POS6119pComponent;
  let fixture: ComponentFixture<Tls27040POS6119pComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls27040POS6119pComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls27040POS6119pComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
