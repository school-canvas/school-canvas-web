import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  imports: [],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    console.log("Auth Layout Component Initialized");
  }

}
