import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN24010CRUComponent } from './fin24010-cru.component';

describe('FIN24010CRUComponent', () => {
  let component: FIN24010CRUComponent;
  let fixture: ComponentFixture<FIN24010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN24010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN24010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
