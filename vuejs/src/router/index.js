import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainerUser = () => import('@/containers/TheContainer_User')
const TheContainerAdmin = () => import('@/containers/TheContainer_Admin')
const TheContainerArttist = () => import('@/containers/TheContainer_Arttist')

// Views User
const Home = () => import('@/views/User/Home')
const News = () => import('@/views/User/News')
const ArtworkDetail = () => import('@/views/User/ArtworkDetail')
const Orders = () => import('@/views/User/Orders')
const Payment = () => import('@/views/User/Payment')
const Bill = () => import('@/views/User/Bill')
const Artworks = () => import('@/views/User/Artworks')

// View Admin
const Overview = () => import('@/views/Admin/Overview')
const ArtworksAdmin = () => import('@/views/Admin/Artworks')
const Submissions = () => import('@/views/Admin/Submissions')
const SubmissionsDetail = () => import('@/views/Admin/SubmissionsDetail')
const Assignment = () => import('@/views/Admin/Assignment')
const OrdersAdmin = () => import('@/views/Admin/Orders')
const Certification = () => import('@/views/Admin/Certification')
const CreateCertification = () => import('@/views/Admin/CreateCertification')
const UsersManagement = () => import('@/views/Admin/UsersManagement')

// View Artist
const ArtistDashboard = () => import('@/views/Artist/Dashboard.vue')
const ArtistProfile = () => import('@/views/Artist/Profile.vue')

// View Page
const Login = () => import('@/views/page/Login.vue')
// const Register = () => import('@/views/page/Register')
// const Page404 = () => import('@/views/page/Page404')
// const Page500 = () => import('@/views/page/Page500')






Vue.use(Router)

export default new Router({
    mode: 'history', // https://router.vuejs.org/api/#mode
    linkActiveClass: 'open active',
    scrollBehavior: () => ({ y: 0 }),
    routes: [
        {
            path: '/',
            name: 'Users',
            component: TheContainerUser,
            children: [
                {
                    path: '',
                    name: 'Home',
                    component: Home
                },
                {
                    path: 'news',
                    name: 'News',
                    component: News
                },
                {
                    path: 'artwork/:id',
                    name: 'ArtworkDetail',
                    component: ArtworkDetail
                },
                {
                    path: 'orders',
                    name: 'Orders',
                    component: Orders
                },
                {
                    path: 'payment',
                    name: 'Payment',
                    component: Payment
                },
                {
                    path: 'bill',
                    name: 'Bill',
                    component: Bill
                },
                {
                    path: 'artworks',
                    name: 'Artworks',
                    component: Artworks
                }
            ]
        },
        {
            path: '/admin',
            name: 'Admin',
            component: TheContainerAdmin,
            children: [
                {
                    path: '',
                    name: 'Overview',
                    component: Overview
                },
                {
                    path: 'artworks',
                    name: 'ArtworksAdmin',
                    component: ArtworksAdmin
                },
                {
                    path: 'submissions',
                    name: 'Submissions',
                    component: Submissions
                },
                {
                    path: 'submissions/:id',
                    name: 'SubmissionsDetail',
                    component: SubmissionsDetail
                },
                {
                    path: 'submissions/:submissionId/assignment/:id',
                    name: 'Assignment',
                    component: Assignment
                },
                {
                    path: 'orders',
                    name: 'OrdersAdmin',
                    component: OrdersAdmin
                },
                {
                    path: 'certification',
                    name: 'Certification',
                    component: Certification
                },
                {
                    path: 'certifications/create',
                    name: 'Create Certification',
                    component: CreateCertification
                },
                {
                    path: 'users-management',
                    name: 'UsersManagement',
                    component: UsersManagement
                }
            ]
        },
        {
            path: '/artist',
            name: 'Artist',
            component: TheContainerArttist,
            children: [
                {
                    path: 'dashboard',
                    name: 'ArtistDashboard',
                    component: ArtistDashboard
                },
                {
                    path: 'profile',
                    name: 'ArtistProfile',
                    component: ArtistProfile
                }
            ]
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        }
    ]
})
