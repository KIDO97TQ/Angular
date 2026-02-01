import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login'
import { HomeComponent } from './shared/components/home/home'


export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    {
        path: 'products',
        loadChildren: () =>
            import('./features/products/products.routes')
                .then(m => m.productRoutes)
    },
    // { nếu như chưa login thì ko thể đặt hàng
    //     path: 'checkout',
    //     loadComponent: () =>
    //         import('./features/checkout/checkout')
    //             .then(m => m.CheckoutComponent),
    //     canActivate: [authGuard]
    // },
    { path: 'login', component: LoginComponent }
];
