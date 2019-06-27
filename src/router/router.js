export default [
  {
    path: '/',
    name: 'home',
    redirect: { name: 'jobShow' },
    component: () => import('../views/Home.vue'),
    children: [
      {
        name: 'about',
        path: 'about',
        component: () => import('../views/About.vue')
      },
      {
        name: 'jobEditor',
        path: 'jobEditor',
        component: () => import('../views/jobEditor.vue')
      },
      {
        name: 'jobMsg',
        path: 'jobMsg/:id',
        component: () => import('../views/jobMsg.vue')
      },
      {
        name: 'jobShow',
        path: 'jobShow',
        component: () => import('../views/jobShow.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login.vue')
  },
  {
    name: 'notFound',
    path: '*',
    component: () => import('../views/notFound.vue')
  }
]
