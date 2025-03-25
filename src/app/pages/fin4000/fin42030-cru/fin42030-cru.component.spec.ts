import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN42030CRUComponent } from './fin42030-cru.component';

describe('FIN42030CRUComponent', () => {
  let component: FIN42030CRUComponent;
  let fixture: ComponentFixture<FIN42030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN42030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN42030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
