import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN41010CRUComponent } from './fin41010-cru.component';

describe('FIN41010CRUComponent', () => {
  let component: FIN41010CRUComponent;
  let fixture: ComponentFixture<FIN41010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN41010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN41010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
