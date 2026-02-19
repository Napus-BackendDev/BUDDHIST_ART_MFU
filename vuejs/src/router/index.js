import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainerUser = () => import('@/containers/TheContainerUser')



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
                    component: () => import('@/views/User/Home')
                },
                {
                    path: 'news',
                    name: 'News',
                    component: () => import('@/views/User/News')
                },
                {
                    path: 'artwork/:id',
                    name: 'ArtworkDetail',
                    component: () => import('@/views/User/ArtworkDetail')
                },
                {
                    path: 'orders',
                    name: 'Orders',
                    component: () => import('@/views/User/Orders')
                },
                {
                    path: 'payment',
                    name: 'Payment',
                    component: () => import('@/views/User/Payment')
                },
                {
                    path: 'bill',
                    name: 'Bill',
                    component: () => import('@/views/User/Bill')
                },
                {
                    path: 'artworks',
                    name: 'Artworks',
                    component: () => import('@/views/User/Artworks')
                }
            ]
        },
    ]
})
