import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN71010CRUComponent } from './fin71010-cru.component';

describe('FIN71010CRUComponent', () => {
  let component: FIN71010CRUComponent;
  let fixture: ComponentFixture<FIN71010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN71010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN71010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
