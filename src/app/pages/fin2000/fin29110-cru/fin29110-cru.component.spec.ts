import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29110CRUComponent } from './fin29110-cru.component';

describe('FIN29110CRUComponent', () => {
  let component: FIN29110CRUComponent;
  let fixture: ComponentFixture<FIN29110CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29110CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29110CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
