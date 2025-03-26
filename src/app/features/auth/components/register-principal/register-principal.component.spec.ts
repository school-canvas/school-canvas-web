import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPrincipalComponent } from './register-principal.component';

describe('RegisterPrincipalComponent', () => {
  let component: RegisterPrincipalComponent;
  let fixture: ComponentFixture<RegisterPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
