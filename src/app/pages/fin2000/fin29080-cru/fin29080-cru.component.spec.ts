import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29080CRUComponent } from './fin29080-cru.component';

describe('FIN29080CRUComponent', () => {
  let component: FIN29080CRUComponent;
  let fixture: ComponentFixture<FIN29080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
