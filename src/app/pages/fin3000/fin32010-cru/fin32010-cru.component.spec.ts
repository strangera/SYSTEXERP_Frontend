import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN32010CRUComponent } from './fin32010-cru.component';

describe('FIN32010CRUComponent', () => {
  let component: FIN32010CRUComponent;
  let fixture: ComponentFixture<FIN32010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN32010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN32010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
