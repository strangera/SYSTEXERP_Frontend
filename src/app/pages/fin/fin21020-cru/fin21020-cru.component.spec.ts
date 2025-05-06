import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN21020CRUComponent } from './fin21020-cru.component';

describe('FIN21020CRUComponent', () => {
  let component: FIN21020CRUComponent;
  let fixture: ComponentFixture<FIN21020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN21020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN21020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
