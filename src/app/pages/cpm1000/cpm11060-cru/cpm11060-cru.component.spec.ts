import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cpm11060CRUComponent } from './cpm11060-cru.component';

describe('Cpm11060CRUComponent', () => {
  let component: Cpm11060CRUComponent;
  let fixture: ComponentFixture<Cpm11060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cpm11060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cpm11060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
