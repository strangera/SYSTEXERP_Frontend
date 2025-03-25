import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN26010CRUComponent } from './fin26010-cru.component';

describe('FIN26010CRUComponent', () => {
  let component: FIN26010CRUComponent;
  let fixture: ComponentFixture<FIN26010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN26010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN26010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
