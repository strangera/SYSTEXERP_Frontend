import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52070CRUComponent } from './fin52070-cru.component';

describe('FIN52070CRUComponent', () => {
  let component: FIN52070CRUComponent;
  let fixture: ComponentFixture<FIN52070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
