import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CatalogoBusqueda } from './pages/catalogo-busqueda/catalogo-busqueda';
import { LineasMaquinaria } from './pages/lineas-maquinaria/lineas-maquinaria';
import { ActualizarCatalogo } from './pages/actualizar-catalogo/actualizar-catalogo';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'catalogo', component: CatalogoBusqueda },
  { path: 'lineas', component: LineasMaquinaria },
  { path: 'actualizar', component: ActualizarCatalogo },
  { path: 'login', component: Login },
];
