import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN42020CRUComponent } from './fin42020-cru.component';

describe('FIN42020CRUComponent', () => {
  let component: FIN42020CRUComponent;
  let fixture: ComponentFixture<FIN42020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN42020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN42020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
