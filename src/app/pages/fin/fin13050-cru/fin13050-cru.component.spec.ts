import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN13050CRUComponent } from './fin13050-cru.component';

describe('FIN13050CRUComponent', () => {
  let component: FIN13050CRUComponent;
  let fixture: ComponentFixture<FIN13050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN13050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN13050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
