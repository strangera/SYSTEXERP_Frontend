import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN42050CRUComponent } from './fin42050-cru.component';

describe('FIN42050CRUComponent', () => {
  let component: FIN42050CRUComponent;
  let fixture: ComponentFixture<FIN42050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN42050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN42050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
