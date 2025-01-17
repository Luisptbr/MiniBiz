import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignUpComponent } from './pages/signup/signup.component';
import { UserComponent } from './pages/user/user.component';
import { ProductComponent } from './pages/product/product.component';
import { AuthGuard } from './services/auth-guard.service';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "signup",
        component: SignUpComponent
    },
    {
        path: "user",
        component: UserComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "products",
        component: ProductComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "dashboard",
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    
    
];
