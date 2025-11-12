import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildProgressComponent } from './child-progress.component';

describe('ChildProgressComponent', () => {
  let component: ChildProgressComponent;
  let fixture: ComponentFixture<ChildProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChildProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
