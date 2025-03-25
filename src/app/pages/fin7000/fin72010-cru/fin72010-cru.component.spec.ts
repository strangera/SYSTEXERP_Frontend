import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN72010CRUComponent } from './fin72010-cru.component';

describe('FIN72010CRUComponent', () => {
  let component: FIN72010CRUComponent;
  let fixture: ComponentFixture<FIN72010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN72010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN72010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
