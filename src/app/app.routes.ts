import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { StateGuard } from './guards/state.guard';

export const routes: Routes = [
    
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard/admin',
    data: { role: '1' },
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'dashboard/productor',
    data: { role: '2' },
    loadComponent: () => import('./components/productor/productor.component').then(m => m.ProductorComponent)
  },
  {
    path: 'dashboard/consumidor',
    data: { role: '3' },
    loadComponent: () => import('./components/consumidor/consumidor.component').then(m => m.ConsumidorComponent)
  }

];
