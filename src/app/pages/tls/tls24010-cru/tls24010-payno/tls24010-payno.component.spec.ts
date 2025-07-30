import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls24010PaynoComponent } from './tls24010-payno.component';

describe('Tls24010PaynoComponent', () => {
  let component: Tls24010PaynoComponent;
  let fixture: ComponentFixture<Tls24010PaynoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls24010PaynoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls24010PaynoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
