import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list';
import { ProductDetailComponent } from './product-detail/product-detail';
import { authGuard } from '../../Core/auth/auth.guard';

export const productRoutes: Routes = [
    {
        path: '',
        component: ProductListComponent
        // canActivate: [authGuard]
    },
    {
        path: ':id',
        component: ProductDetailComponent
        // canActivate: [authGuard]
    }
];
