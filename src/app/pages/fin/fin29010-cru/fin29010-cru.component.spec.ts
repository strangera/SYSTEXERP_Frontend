import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29010CRUComponent } from './fin29010-cru.component';

describe('FIN29010CRUComponent', () => {
  let component: FIN29010CRUComponent;
  let fixture: ComponentFixture<FIN29010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
