import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN32030CRUComponent } from './fin32030-cru.component';

describe('FIN32030CRUComponent', () => {
  let component: FIN32030CRUComponent;
  let fixture: ComponentFixture<FIN32030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN32030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN32030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
