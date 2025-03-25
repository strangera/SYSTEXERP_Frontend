import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11010CRUComponent } from './fin11010-cru.component';

describe('FIN11010CRUComponent', () => {
  let component: FIN11010CRUComponent;
  let fixture: ComponentFixture<FIN11010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
