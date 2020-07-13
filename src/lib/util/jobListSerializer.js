// jobList页面需要用到的格式校验规则

const serializer = {
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
    id: 'number',
    job_name: 'string',
    custom_tag: [{
      id: 'number',
      custom_tag_name: 'string'
    }],
    test_area: [{
      id: 'number',
      description: 'string'
    }]
  }],
  getManufacturerSerializer: {
    manufacturers: [{
      id: 'number',
      manufacturer_name: 'string',
      phonemodel: [{
        id: 'number',
        phone_model_name: 'string'
      }],
      romversion: [{
        id: 'number',
        version: 'string'
      }]
    }]
  }

}

const jobSerializer = {
  android_version: [{
    id: 'number',
    version: 'string'
  }],
  author: {
    id: 'number',
    username: 'string'
  },
  custom_tag: [{
    id: 'number',
    custom_tag_name: 'string'
  }],
  description: 'string',
  id: 'number',
  job_label: 'string',
  job_name: 'string',
  job_type: 'string',
  phone_models: [{
    id: 'number',
    phone_model_name: 'string',
    manufacturer: {
      id: 'number',
      manufacturer_name: 'string'
    }
  }],
  rom_version: [{
    id: 'number',
    version: 'string',
    manufacturer: {
      id: 'number',
      manufacturer_name: 'string'
    }
  }],
  test_area: [{
    id: 'number',
    description: 'string'
  }],
  ui_json_file: 'string'
}
const formInfoSerializer = {
  job_name: 'string',
  test_area: [],
  custom_tag: [],
  description: 'string',
  manufacturer: 'string',
  phone_models: [],
  rom_version: [],
  android_version: []
}

export {
  serializer,
  jobSerializer,
  formInfoSerializer
}
