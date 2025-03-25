import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63040CRUComponent } from './fin63040-cru.component';

describe('FIN63040CRUComponent', () => {
  let component: FIN63040CRUComponent;
  let fixture: ComponentFixture<FIN63040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
