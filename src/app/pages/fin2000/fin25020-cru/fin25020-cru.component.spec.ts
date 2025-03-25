import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN25020CRUComponent } from './fin25020-cru.component';

describe('FIN25020CRUComponent', () => {
  let component: FIN25020CRUComponent;
  let fixture: ComponentFixture<FIN25020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN25020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN25020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
