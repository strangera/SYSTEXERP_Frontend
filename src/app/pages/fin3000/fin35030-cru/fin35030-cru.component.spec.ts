import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35030CRUComponent } from './fin35030-cru.component';

describe('FIN35030CRUComponent', () => {
  let component: FIN35030CRUComponent;
  let fixture: ComponentFixture<FIN35030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
