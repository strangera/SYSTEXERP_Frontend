import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11030CRUComponent } from './fin11030-cru.component';

describe('FIN11030CRUComponent', () => {
  let component: FIN11030CRUComponent;
  let fixture: ComponentFixture<FIN11030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
