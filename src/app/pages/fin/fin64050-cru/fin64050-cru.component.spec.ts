import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN64050CRUComponent } from './fin64050-cru.component';

describe('FIN64050CRUComponent', () => {
  let component: FIN64050CRUComponent;
  let fixture: ComponentFixture<FIN64050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN64050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN64050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
