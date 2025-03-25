import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankdemoComponent } from './bankdemo.component';

describe('BankdemoComponent', () => {
  let component: BankdemoComponent;
  let fixture: ComponentFixture<BankdemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankdemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankdemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
