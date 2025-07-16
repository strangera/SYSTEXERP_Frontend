import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11050CRUComponent } from './fin11050-cru.component';

describe('FIN11050CRUComponent', () => {
  let component: FIN11050CRUComponent;
  let fixture: ComponentFixture<FIN11050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
