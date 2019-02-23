/* eslint-disable */
import Dashboard from '@/components/Dashboard'
import ProductList from '@/components/ProductList'
import Signup from '@/components/Signup'
import Login from '@/components/Login'
import store from '../store'

let routes = [
  {
    path: '/greeting',
    name: 'dashboard',
    component: Dashboard,
    meta: { 
        requiresAuth: true
    }
  },
  {
    path: '/',
    name: 'productlist',
    component: ProductList,
    meta: { 
        requiresAuth: true
    }
  },
  {
    path: '/signup',
    name: 'signup',
    component: Signup
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  }

]


export default routes
