import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN22030CRUComponent } from './fin22030-cru.component';

describe('FIN22030CRUComponent', () => {
  let component: FIN22030CRUComponent;
  let fixture: ComponentFixture<FIN22030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN22030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN22030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
