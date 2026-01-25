import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/product-list/product-list';
import { ProductDetailComponent } from './features/products/product-detail/product-detail';
import { ProductFormComponent } from './features/products/product-form/product-form';
import { authGuard } from './Core/auth/auth.guard'
import { LoginComponent } from './features/auth/login/login'

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    {
        path: 'products/new',
        component: ProductFormComponent,
        canActivate: [authGuard]
    },
    {
        path: 'products',
        component: ProductListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'products/:id',
        component: ProductDetailComponent,
        canActivate: [authGuard]
    },
    { path: 'login', component: LoginComponent },

];
