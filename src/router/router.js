export default [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    children: [
      {
        name: 'about',
        path: 'about',
        component: () => import('../views/About.vue')
      },
      {
        name: 'jobEditor',
        path: 'jobEditor/:jobLabel',
        component: () => import('../views/jobEditor.vue')
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
    path: '/notFound',
    component: () => import('../views/notFound.vue')
  }
]
