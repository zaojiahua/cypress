export default [
  {
    path: '/',
    name: 'home',
    redirect: { name: 'jobList' },
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
        name: 'jobList',
        path: 'jobList',
        component: () => import('../views/jobList.vue')
      },
      {
        name: 'createJob',
        path: 'createJob',
        component: () => import('../views/CreateJob.vue')
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
