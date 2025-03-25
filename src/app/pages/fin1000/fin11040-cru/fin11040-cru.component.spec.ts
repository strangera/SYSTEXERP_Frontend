import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11040CRUComponent } from './fin11040-cru.component';

describe('FIN11040CRUComponent', () => {
  let component: FIN11040CRUComponent;
  let fixture: ComponentFixture<FIN11040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
