school-management/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   └── auth.model.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── user.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── principal.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   └── core.module.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   │   ├── login/
│   │   │   │   │   │   ├── login.component.ts
│   │   │   │   │   │   ├── login.component.html
│   │   │   │   │   │   └── login.component.scss
│   │   │   │   │   ├── register-principal/
│   │   │   │   │   │   ├── register-principal.component.ts
│   │   │   │   │   │   ├── register-principal.component.html
│   │   │   │   │   │   └── register-principal.component.scss
│   │   │   │   │   └── register-user/
│   │   │   │   │       ├── register-user.component.ts
│   │   │   │   │       ├── register-user.component.html
│   │   │   │   │       └── register-user.component.scss
│   │   │   │   ├── auth-routing.module.ts
│   │   │   │   └── auth.module.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── components/
│   │   │   │   │   ├── dashboard-home/
│   │   │   │   │   │   ├── dashboard-home.component.ts
│   │   │   │   │   │   ├── dashboard-home.component.html
│   │   │   │   │   │   └── dashboard-home.component.scss
│   │   │   │   │   ├── principal-dashboard/
│   │   │   │   │   │   ├── principal-dashboard.component.ts
│   │   │   │   │   │   ├── principal-dashboard.component.html
│   │   │   │   │   │   └── principal-dashboard.component.scss
│   │   │   │   │   ├── teacher-dashboard/
│   │   │   │   │   │   ├── teacher-dashboard.component.ts
│   │   │   │   │   │   ├── teacher-dashboard.component.html
│   │   │   │   │   │   └── teacher-dashboard.component.scss
│   │   │   │   │   └── student-dashboard/
│   │   │   │   │       ├── student-dashboard.component.ts
│   │   │   │   │       ├── student-dashboard.component.html
│   │   │   │   │       └── student-dashboard.component.scss
│   │   │   │   ├── dashboard-routing.module.ts
│   │   │   │   └── dashboard.module.ts
│   │   │   └── home/
│   │   │       ├── components/
│   │   │       │   └── home/
│   │   │       │       ├── home.component.ts
│   │   │       │       ├── home.component.html
│   │   │       │       └── home.component.scss
│   │   │       ├── home-routing.module.ts
│   │   │       └── home.module.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   │   ├── header.component.ts
│   │   │   │   │   ├── header.component.html
│   │   │   │   │   └── header.component.scss
│   │   │   │   └── footer/
│   │   │   │       ├── footer.component.ts
│   │   │   │       ├── footer.component.html
│   │   │   │       └── footer.component.scss
│   │   │   └── shared.module.ts
│   │   ├── layouts/
│   │   │   ├── main-layout/
│   │   │   │   ├── main-layout.component.ts
│   │   │   │   ├── main-layout.component.html
│   │   │   │   └── main-layout.component.scss
│   │   │   ├── auth-layout/
│   │   │   │   ├── auth-layout.component.ts
│   │   │   │   ├── auth-layout.component.html
│   │   │   │   └── auth-layout.component.scss
│   │   │   └── layouts.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app-routing.module.ts
│   │   └── app.module.ts
│   ├── assets/
│   │   └── images/
│   │       ├── school-logo.png
│   │       └── school-hero.jpg
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles/
│   │   └── styles.scss
│   ├── index.html
│   ├── main.ts
│   └── polyfills.ts
├── angular.json
├── package.json
├── tsconfig.json
└── README.md