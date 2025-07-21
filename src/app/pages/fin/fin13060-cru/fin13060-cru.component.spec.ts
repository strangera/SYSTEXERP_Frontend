import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN13060CRUComponent } from './fin13060-cru.component';

describe('FIN13060CRUComponent', () => {
  let component: FIN13060CRUComponent;
  let fixture: ComponentFixture<FIN13060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN13060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN13060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
