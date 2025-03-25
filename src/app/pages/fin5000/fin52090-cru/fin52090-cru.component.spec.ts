import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52090CRUComponent } from './fin52090-cru.component';

describe('FIN52090CRUComponent', () => {
  let component: FIN52090CRUComponent;
  let fixture: ComponentFixture<FIN52090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
