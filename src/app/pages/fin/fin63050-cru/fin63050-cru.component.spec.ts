import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63050CRUComponent } from './fin63050-cru.component';

describe('FIN63050CRUComponent', () => {
  let component: FIN63050CRUComponent;
  let fixture: ComponentFixture<FIN63050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
