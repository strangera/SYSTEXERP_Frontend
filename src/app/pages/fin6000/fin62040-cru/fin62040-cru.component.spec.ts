import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN62040CRUComponent } from './fin62040-cru.component';

describe('FIN62040CRUComponent', () => {
  let component: FIN62040CRUComponent;
  let fixture: ComponentFixture<FIN62040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN62040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN62040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
