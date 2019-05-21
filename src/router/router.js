// import Home from '@/views/Home.vue'

export default [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    children: [
      {
        path: 'about',
        component: () => import('@/views/About.vue')
      }
    ]
  }
]
