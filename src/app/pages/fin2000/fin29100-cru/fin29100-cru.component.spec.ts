import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29100CRUComponent } from './fin29100-cru.component';

describe('FIN29100CRUComponent', () => {
  let component: FIN29100CRUComponent;
  let fixture: ComponentFixture<FIN29100CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29100CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29100CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
