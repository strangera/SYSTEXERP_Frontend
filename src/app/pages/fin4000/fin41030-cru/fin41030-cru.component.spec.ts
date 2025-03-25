import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN41030CRUComponent } from './fin41030-cru.component';

describe('FIN41030CRUComponent', () => {
  let component: FIN41030CRUComponent;
  let fixture: ComponentFixture<FIN41030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN41030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN41030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
