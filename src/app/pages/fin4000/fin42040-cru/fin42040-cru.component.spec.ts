import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN42040CRUComponent } from './fin42040-cru.component';

describe('FIN42040CRUComponent', () => {
  let component: FIN42040CRUComponent;
  let fixture: ComponentFixture<FIN42040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN42040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN42040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
