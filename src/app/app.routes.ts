import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
    
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard/admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: '1' },
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'dashboard/productor',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: '2' },
    loadComponent: () => import('./components/productor/productor.component').then(m => m.ProductorComponent)
  },
  {
    path: 'dashboard/consumidor',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: '3' },
    loadComponent: () => import('./components/consumidor/consumidor.component').then(m => m.ConsumidorComponent)
  },
  {
    path: 'dashboard/consumidor/carrito',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: '3' },
    loadComponent: () => import('./components/carrito/carrito.component').then(m => m.CarritoComponent)

  },
  {
    path: '**',
    redirectTo: 'login'
  }

];
