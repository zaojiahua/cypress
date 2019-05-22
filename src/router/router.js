// import Home from '@/views/Home.vue'

export default [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    children: [
      {
        name: 'about',
        path: 'about',
        component: () => import('@/views/About.vue')
      },
      {
        name: 'jobOperation',
        path: 'jobOperation',
        component: () => import('@/views/jobOperation.vue')
      }
    ]
  }
]
