import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63010CRUComponent } from './fin63010-cru.component';

describe('FIN63010CRUComponent', () => {
  let component: FIN63010CRUComponent;
  let fixture: ComponentFixture<FIN63010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
