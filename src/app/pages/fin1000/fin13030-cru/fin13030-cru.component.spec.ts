import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN13030CRUComponent } from './fin13030-cru.component';

describe('FIN13030CRUComponent', () => {
  let component: FIN13030CRUComponent;
  let fixture: ComponentFixture<FIN13030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN13030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN13030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
