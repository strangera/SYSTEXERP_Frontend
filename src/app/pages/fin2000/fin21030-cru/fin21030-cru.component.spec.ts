import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN21030CRUComponent } from './fin21030-cru.component';

describe('FIN21030CRUComponent', () => {
  let component: FIN21030CRUComponent;
  let fixture: ComponentFixture<FIN21030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN21030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN21030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
