// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { MainLayoutComponent } from './main-layout/main-layout.component';
// import { HomeComponent } from '../features/home/components/home/home.component';

// const routes: Routes = [
//     {
//         path: '', component: MainLayoutComponent, children: [
//             {
//                 path: 'home',
//                 component: HomeComponent
//             },
//             {
//                 path: 'about',
//                 loadChildren: () => import('../features/about/about.module').then(m => m.AboutModule)
//             },
//             {
//                 path: 'contact',
//                 loadChildren: () => import('../features/contact/contact.module').then(m => m.ContactModule)
//             }
//     ]}
// ];

// @NgModule({
//     imports: [RouterModule.forChild(routes)],
//     exports: [RouterModule],
// })
// export class LayoutsRoutingModule {}