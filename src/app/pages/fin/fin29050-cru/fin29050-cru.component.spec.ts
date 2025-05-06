import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29050CRUComponent } from './fin29050-cru.component';

describe('FIN29050CRUComponent', () => {
  let component: FIN29050CRUComponent;
  let fixture: ComponentFixture<FIN29050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
