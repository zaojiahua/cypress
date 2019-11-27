// jobList页面需要用到的格式校验规则

export default {
  getPhoneModelSerializer: {
    phonemodels: [{
      id: 'number',
      phone_model_name: 'string'
    }]
  },
  getJobTestAreaSerializer: {
    jobtestareas: [{
      id: 'number',
      description: 'string'
    }]
  },
  getAndroidVersionSerializer: {
    androidversions: [{
      id: 'number',
      version: 'string'
    }]
  },
  getRomVersionSerializer: {
    romversions: [{
      id: 'number',
      version: 'string'
    }]
  },
  getReefUserSerializer: {
    reefusers: [{
      id: 'number',
      username: 'string',
      last_name: 'string'
    }]
  },
  getCustomTagSerializer: {
    customtags: [{
      id: 'number',
      custom_tag_name: 'string'
    }]
  },
  jobSerializer: [{
    custom_tag: [{
      id: 'number',
      custom_tag_name: 'string'
    }],
    id: 'number',
    job_name: 'string',
    test_area: [{
      id: 'number',
      description: 'string'
    }]
  }]

}
