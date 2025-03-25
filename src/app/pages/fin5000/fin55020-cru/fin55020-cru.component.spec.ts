import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55020CRUComponent } from './fin55020-cru.component';

describe('FIN55020CRUComponent', () => {
  let component: FIN55020CRUComponent;
  let fixture: ComponentFixture<FIN55020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
