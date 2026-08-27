import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainerUser = () => import('@/containers/page/TheContainer')
const TheContainerAdmin = () => import('@/containers/admin/TheContainer')

// Views User
const Home = () => import('@/views/page/Home')
const News = () => import('@/views/page/News')
const ArtworkDetail = () => import('@/views/page/ArtworkDetail')

const Payment = () => import('@/views/page/Payment')
const Bill = () => import('@/views/page/Bill')
const Artworks = () => import('@/views/page/Artworks')
const Contact = () => import('@/views/page/Contact')
const NewsDetail = () => import('@/views/page/NewsDetail')
const Login = () => import('@/projects/views/Login')
const SystemMessage = () => import('@/views/page/SystemMessage')
const LegalNotice = () => import('@/views/page/LegalNotice')

// View Admin
const Overview = () => import('@/views/Admin/Overview')
const Analytics = () => import('@/views/Admin/Analytics')
const ArtworksAdmin = () => import('@/views/Admin/Artworks')
const Submissions = () => import('@/views/Admin/Submissions')
const SubmissionsDetail = () => import('@/views/Admin/SubmissionsDetail')
const Assignment = () => import('@/views/Admin/Assignment')
const OrdersAdmin = () => import('@/views/Admin/Orders')
// const Certification = () => import('@/views/Admin/Certification')
// const CreateCertification = () => import('@/views/Admin/CreateCertification')
const UsersManagement = () => import('@/views/Admin/UsersManagement')
const NewsAdmin = () => import('@/views/Admin/News')
const SystemSettings = () => import('@/views/Admin/SystemSettings')

// View Artist
const ArtistProfile = () => import('@/views/Artist/Profile.vue')
const ArtistSubmissions = () => import('@/views/Artist/Submissions.vue')
const ArtistSubmissionsDetail = () => import('@/views/Artist/SubmissionsDetail.vue')

// View User Dashboard
const UserProfile = () => import('@/views/User/index.vue')
const UserOrder = () => import('@/views/User/order.vue')

// View Page

// const Register = () => import('@/views/page/Register')
// const Page404 = () => import('@/views/page/Page404')
// const Page500 = () => import('@/views/page/Page500')






Vue.use(Router)

const router = new Router({
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
                    path: 'payment',
                    name: 'Payment',
                    component: Payment
                },
                {
                    path: 'bill',
                    redirect: '/payment?step=3'
                },
                {
                    path: 'artworks',
                    name: 'Artworks',
                    component: Artworks
                },
                {
                    path: 'about',
                    redirect: '/'
                },
                {
                    path: 'contact',
                    name: 'Contact',
                    component: Contact
                },
                {
                    path: 'news/:id',
                    name: 'NewsDetail',
                    component: NewsDetail
                },
                {
                    path: 'artist-profile/:id',
                    name: 'ArtistPublicProfile',
                    component: ArtistProfile
                },
                {
                    path: 'login',
                    name: 'Login',
                    component: Login
                },
                {
                    path: 'privacy',
                    name: 'Privacy',
                    component: LegalNotice,
                    meta: { legal: 'privacy' }
                },
                {
                    path: 'terms',
                    name: 'Terms',
                    component: LegalNotice,
                    meta: { legal: 'terms' }
                },
                {
                    path: 'forbidden',
                    name: 'Forbidden',
                    component: SystemMessage,
                    meta: { state: 'forbidden' }
                }
            ]
        },
        {
            path: '/admin',
            name: 'Admin',
            component: TheContainerAdmin,
            meta: { requiresAuth: true, roles: ['admin'] },
            children: [
                {
                    path: '',
                    name: 'Overview',
                    component: Overview
                },
                {
                    path: 'analytics',
                    name: 'Analytics',
                    component: Analytics
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
                    path: 'users-management',
                    name: 'UsersManagement',
                    component: UsersManagement
                },
                {
                    path: 'news',
                    name: 'NewsAdmin',
                    component: NewsAdmin
                },
                {
                    path: 'settings',
                    name: 'SystemSettings',
                    component: SystemSettings
                }
            ]
        },
        {
            path: '/artist',
            name: 'Artist',
            component: TheContainerUser,
            meta: { requiresAuth: true, roles: ['artist', 'evaluator', 'admin'] },
            redirect: '/artist/submissions',
            children: [
                {
                    path: 'profile',
                    name: 'ArtistProfile',
                    component: ArtistProfile
                },
                {
                    path: 'submissions',
                    name: 'ArtistSubmissions',
                    component: ArtistSubmissions
                },
                {
                    path: 'submissions/:id',
                    name: 'ArtistSubmissionsDetail',
                    component: ArtistSubmissionsDetail
                }
            ]
        },
        {
            path: '/user',
            name: 'UserDashboard',
            component: TheContainerUser,
            meta: { requiresAuth: true },
            redirect: '/user/profile',
            children: [
                {
                    path: 'profile',
                    name: 'UserProfile',
                    component: UserProfile
                },
                {
                    path: 'order',
                    name: 'UserOrder',
                    component: UserOrder
                }
            ]
        },
        {
            path: '*',
            name: 'NotFound',
            component: TheContainerUser,
            children: [{ path: '', component: SystemMessage }]
        }

    ]
})

const readSession = () => {
    try {
        return JSON.parse(localStorage.getItem('objs')) || {};
    } catch (error) {
        localStorage.removeItem('objs');
        return {};
    }
};

router.beforeEach((to, from, next) => {
    const protectedRoute = to.matched.find(record => record.meta && record.meta.requiresAuth);
    if (!protectedRoute) return next();

    const session = readSession();
    if (!session.xAccessToken) {
        return next({ name: 'Login', query: { redirect: to.fullPath } });
    }

    const allowedRoles = protectedRoute.meta.roles;
    const currentRole = String(session.role || '').toLowerCase();
    if (allowedRoles && !allowedRoles.includes(currentRole)) {
        return next({ name: 'Forbidden' });
    }

    return next();
});

export default router
