import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainerUser = () => import('@/containers/page/TheContainer')
const TheContainerAdmin = () => import('@/containers/admin/TheContainer')
const TheContainerArtist = () => import('@/containers/artist/TheContainer')
const TheContainerDashboardUser = () => import('@/containers/user/TheContainer')

// Views User
const Home = () => import('@/views/page/Home')
const News = () => import('@/views/page/News')
const ArtworkDetail = () => import('@/views/page/ArtworkDetail')

const Payment = () => import('@/views/page/Payment')
const Bill = () => import('@/views/page/Bill')
const Artworks = () => import('@/views/page/Artworks')
const About = () => import('@/views/page/About')
const NewsDetail = () => import('@/views/page/NewsDetail')

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
const NewsAdmin = () => import('@/views/Admin/News')

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
                },
                {
                    path: 'about',
                    name: 'About',
                    component: About
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
                },
                {
                    path: 'news',
                    name: 'NewsAdmin',
                    component: NewsAdmin
                }
            ]
        },
        {
            path: '/artist',
            name: 'Artist',
            component: TheContainerArtist,
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
            component: TheContainerDashboardUser,
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

    ]
})
