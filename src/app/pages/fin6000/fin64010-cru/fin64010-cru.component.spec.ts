import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN64010CRUComponent } from './fin64010-cru.component';

describe('FIN64010CRUComponent', () => {
  let component: FIN64010CRUComponent;
  let fixture: ComponentFixture<FIN64010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN64010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN64010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
