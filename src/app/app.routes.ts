import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login'
import { HomeComponent } from './features/home/home'


export const routes: Routes = [
    // { path: '', redirectTo: 'home', pathMatch: 'full' },

    // {
    //     path: 'products',
    //     loadChildren: () =>
    //         import('./features/products/products.routes')
    //             .then(m => m.productRoutes)
    // },
    // // { nếu như chưa login thì ko thể đặt hàng
    // //     path: 'checkout',
    // //     loadComponent: () =>
    // //         import('./features/checkout/checkout')
    // //             .then(m => m.CheckoutComponent),
    // //     canActivate: [authGuard]
    // // },
    // { path: '', component: HomeComponent },
    // { path: 'login', component: LoginComponent }
    {
        path: '',
        loadComponent: () =>
            import('./features/home/home')
                .then(m => m.HomeComponent)
    },
    {
        path: 'products/:type',
        loadChildren: () =>
            import('./features/products/products.routes')
                .then(m => m.productRoutes)
    },
    {
        path: 'products',
        loadChildren: () =>
            import('./features/products/products.routes')
                .then(m => m.productRoutes)
    },
    {
        path: 'about',
        loadComponent: () =>
            import('./features/pages/about/about')
                .then(m => m.About)
    },
    {
        path: 'rulesrent',
        loadComponent: () =>
            import('./features/pages/regulations/regrent/regrent')
                .then(m => m.Regrent)
    },
    {
        path: 'rulescomp',
        loadComponent: () =>
            import('./features/pages/regulations/regcomp/regcomp')
                .then(m => m.Regcomp)
    },
    {
        path: 'payment',
        loadComponent: () =>
            import('./features/pages/suports/payment/payment')
                .then(m => m.Payment)
    },
    {
        path: 'guidrent',
        loadComponent: () =>
            import('./features/pages/suports/guidrent/guidrent')
                .then(m => m.Guidrent)
    },
    {
        path: 'spreturn',
        loadComponent: () =>
            import('./features/pages/suports/spreturn/spreturn')
                .then(m => m.Spreturn)
    },
    {
        path: 'exprent',
        loadComponent: () =>
            import('./features/pages/suports/exprent/exprent')
                .then(m => m.Exprent)
    },
    {
        path: 'guidcontent',
        loadComponent: () =>
            import('./features/pages/suports/guidcontent/guidcontent')
                .then(m => m.Guidcontent)
    },
    {
        path: 'contact',
        loadComponent: () =>
            import('./features/pages/contact/contact')
                .then(m => m.Contact)
    },
    // {
    //     path: 'checkout',
    //     loadChildren: () =>
    //         import('./features/checkout/checkout.routes')
    //             .then(m => m.checkoutRoutes)
    //     // canActivate: [authGuard]
    // },
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login')
                .then(m => m.LoginComponent)
    },
    {
        path: 'cart',
        loadComponent: () =>
            import('./features/carts/carts/carts')
                .then(m => m.CartComponent)
    },
    {
        path: 'profile',
        loadComponent: () =>
            import('./features/account/profile/profile')
                .then(m => m.ProfileComponent)
    },
    {
        path: 'settings',
        loadComponent: () =>
            import('./features/account/mysetting/mysetting')
                .then(m => m.MysettingComponent)
    },
    {
        path: 'myorder',
        loadComponent: () =>
            import('./features/account/myorder/myorder')
                .then(m => m.MyorderComponent)
    },
    {
        path: 'checkout',
        loadComponent: () =>
            import('./features/checkout/checkout-component/checkout-component')
                .then(m => m.CheckoutComponent)
    },
    {
        path: 'payment-success',
        loadComponent: () =>
            import('./features/checkout/payment-success/payment-success')
                .then(m => m.PaymentSuccessComponent)
    },
    {
        path: 'order-detail',
        loadComponent: () =>
            import('./features/account/myorder/order-detail/order-detail')
                .then(m => m.OrderComponent)
    }
];
