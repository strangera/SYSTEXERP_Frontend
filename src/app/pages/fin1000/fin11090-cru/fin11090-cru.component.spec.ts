import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11090CRUComponent } from './fin11090-cru.component';

describe('FIN11090CRUComponent', () => {
  let component: FIN11090CRUComponent;
  let fixture: ComponentFixture<FIN11090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
