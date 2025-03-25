import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55120CRUComponent } from './fin55120-cru.component';

describe('FIN55120CRUComponent', () => {
  let component: FIN55120CRUComponent;
  let fixture: ComponentFixture<FIN55120CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55120CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55120CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
