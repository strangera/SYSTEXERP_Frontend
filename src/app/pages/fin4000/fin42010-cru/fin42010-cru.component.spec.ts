import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN42010CRUComponent } from './fin42010-cru.component';

describe('FIN42010CRUComponent', () => {
  let component: FIN42010CRUComponent;
  let fixture: ComponentFixture<FIN42010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN42010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN42010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
