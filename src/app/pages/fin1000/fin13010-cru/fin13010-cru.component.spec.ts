import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN13010CRUComponent } from './fin13010-cru.component';

describe('FIN13010CRUComponent', () => {
  let component: FIN13010CRUComponent;
  let fixture: ComponentFixture<FIN13010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN13010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN13010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
