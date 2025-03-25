import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55010CRUComponent } from './fin55010-cru.component';

describe('FIN55010CRUComponent', () => {
  let component: FIN55010CRUComponent;
  let fixture: ComponentFixture<FIN55010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
