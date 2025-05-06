import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cpm12050HQComponent } from './cpm12050-hq.component';

describe('Cpm12050HQComponent', () => {
  let component: Cpm12050HQComponent;
  let fixture: ComponentFixture<Cpm12050HQComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cpm12050HQComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cpm12050HQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
