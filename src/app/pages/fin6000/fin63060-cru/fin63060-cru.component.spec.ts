import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63060CRUComponent } from './fin63060-cru.component';

describe('FIN63060CRUComponent', () => {
  let component: FIN63060CRUComponent;
  let fixture: ComponentFixture<FIN63060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
