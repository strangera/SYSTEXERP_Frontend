import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55090CRUComponent } from './fin55090-cru.component';

describe('FIN55090CRUComponent', () => {
  let component: FIN55090CRUComponent;
  let fixture: ComponentFixture<FIN55090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
