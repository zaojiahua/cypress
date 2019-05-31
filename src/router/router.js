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
        path: 'jobEditor',
        component: () => import('../views/jobEditor.vue')
      },
      {
        name: 'jobEditor1',
        path: 'jobEditor1',
        component: () => import('../views/jobEditor1.vue')
      },
      {
        name: 'jobEditorOther',
        path: 'jobEditorOther',
        component: () => import('../views/jobEditorOther.vue')
      },
      {
        name: 'jobMsg',
        path: 'jobMsg/:id',
        component: () => import('../views/jobMsg.vue')
      },
      {
        name: 'test',
        path: 'test/:id',
        component: () => import('../views/test.vue')
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
