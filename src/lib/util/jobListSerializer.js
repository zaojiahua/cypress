// jobList页面需要用到的格式校验规则

const serializer = {
  phoneModelSerializer: {
    phonemodels: [{
      id: 'number',
      phone_model_name: 'string'
    }]
  },
  testAreaSerializer: {
    jobtestareas: [{
      id: 'number',
      description: 'string'
    }]
  },
  androidVersionSerializer: {
    androidversions: [{
      id: 'number',
      version: 'string'
    }]
  },
  romVersionSerializer: {
    romversions: [{
      id: 'number',
      version: 'string'
    }]
  },
  reefUserSerializer: {
    reefusers: [{
      id: 'number',
      username: 'string',
      last_name: 'string'
    }]
  },
  customTagSerializer: {
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
    }],
    phone_model: [{
      id: 'number',
      phone_model_name: 'string'
    }]
  }],
  manufacturerSerializer: {
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
  draft: 'boolean',
  job_label: 'string',
  job_name: 'string',
  job_type: 'string',
  cabinet_type: 'string',
  case_number: 'string',
  priority: 'string',
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
  ui_json_file: 'string',
  job_flow: [{
    id: 'number',
    name: 'string',
    ui_json_file: 'string',
    order: 'string',
    description:'string'
  }],
}

export {
  serializer,
  jobSerializer
}
