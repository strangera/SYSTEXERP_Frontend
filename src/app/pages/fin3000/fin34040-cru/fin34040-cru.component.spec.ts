import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN34040CRUComponent } from './fin34040-cru.component';

describe('FIN34040CRUComponent', () => {
  let component: FIN34040CRUComponent;
  let fixture: ComponentFixture<FIN34040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN34040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN34040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
