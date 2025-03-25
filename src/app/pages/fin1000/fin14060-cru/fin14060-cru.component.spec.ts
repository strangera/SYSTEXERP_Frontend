import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14060CRUComponent } from './fin14060-cru.component';

describe('FIN14060CRUComponent', () => {
  let component: FIN14060CRUComponent;
  let fixture: ComponentFixture<FIN14060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
