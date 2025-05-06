import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55060CRUComponent } from './fin55060-cru.component';

describe('FIN55060CRUComponent', () => {
  let component: FIN55060CRUComponent;
  let fixture: ComponentFixture<FIN55060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
