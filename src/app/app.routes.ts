import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login'

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },

    {
        path: 'products',
        loadChildren: () =>
            import('./features/products/products.routes')
                .then(m => m.productRoutes)
    },

    { path: 'login', component: LoginComponent }
];
