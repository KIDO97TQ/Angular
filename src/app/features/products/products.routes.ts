import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list';
import { ProductDetailComponent } from './product-detail/product-detail';
import { ProductFormComponent } from './product-form/product-form';
import { authGuard } from '../../Core/auth/auth.guard';

export const productRoutes: Routes = [
    {
        path: '',
        component: ProductListComponent
        // canActivate: [authGuard]
    },
    {
        path: 'new',
        component: ProductFormComponent
        // canActivate: [authGuard]
    },
    {
        path: ':id',
        component: ProductDetailComponent
        // canActivate: [authGuard]
    }
];
