import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55130CRUComponent } from './fin55130-cru.component';

describe('FIN55130CRUComponent', () => {
  let component: FIN55130CRUComponent;
  let fixture: ComponentFixture<FIN55130CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55130CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55130CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
