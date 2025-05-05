import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN34030CRUComponent } from './fin34030-cru.component';

describe('FIN34030CRUComponent', () => {
  let component: FIN34030CRUComponent;
  let fixture: ComponentFixture<FIN34030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN34030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN34030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
