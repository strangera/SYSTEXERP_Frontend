import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63030CRUComponent } from './fin63030-cru.component';

describe('FIN63030CRUComponent', () => {
  let component: FIN63030CRUComponent;
  let fixture: ComponentFixture<FIN63030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
