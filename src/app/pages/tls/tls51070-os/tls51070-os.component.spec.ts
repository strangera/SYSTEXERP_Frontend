import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls51070OsComponent } from './tls51070-os.component';

describe('Tls51070OsComponent', () => {
  let component: Tls51070OsComponent;
  let fixture: ComponentFixture<Tls51070OsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls51070OsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls51070OsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
