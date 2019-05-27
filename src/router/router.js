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
      // {
      //   name: 'jobOperation',
      //   path: 'jobOperation',
      //   component: () => import('@/views/jobOperation.vue')
      // },
      {
        name: 'jobAttr',
        path: 'jobMsg/:id',
        component: () => import('../views/jobMsg.vue')
      }
      // {
      //   name: 'test',
      //   path: 'test',
      //   component: () => import('../views/test.vue')
      // }
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
