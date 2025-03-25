import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52080CRUComponent } from './fin52080-cru.component';

describe('FIN52080CRUComponent', () => {
  let component: FIN52080CRUComponent;
  let fixture: ComponentFixture<FIN52080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
