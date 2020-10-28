export default {
  STAR: new Set([
    'IMGTOOL',
    'COMPLEX'
  ]),
  COLORS: {
    START: '#064973',
    SWITCH: '#768BB9',
    NORMAL: '#F76132',
    JOB: '#50A5F4',
    END: '#313131',
    FAIL: '#818286',
    SUCCESS: '#F65A6D',
    FINISH: '#29BB87',
    UNFINISHED: '#F76132',
    UNIT: '#338FF0',
    GROUP: '#50A5F4',
    RESULT: '#3AFFF3',
    STAR: '#ffff00'
  },
  WILL_TOUCH_FILE: new Set([
    'jobResourceFile',
    'jobResourcePicture'
  ]),
  WILL_TOUCH_NAME: {
    'outputFile': '文件名称',
    'outputPicture': '图片名称',
    'outputVideo': '视频名称'
  },
  JOB_DEFAULT_CONFIG: {
    finalResultKey: 0,
    byProductsName: [
      { 'title': '文件名称', 'key': 'outputFile', 'children': [] },
      { 'title': '图片名称', 'key': 'outputPicture', 'children': [] },
      { 'title': '视频名称', 'key': 'outputVideo', 'children': [] }
    ]
  },
  ITEM_DESC: {
    'jobResourceFile': '图片配置文件',
    'jobResourcePicture': '参考标准图片',
    'inputPicture': '输入图片名称',
    'outputPicture': '输出图片名称',
    'inputVideo': '输入视频名称',
    'outputVideo': '输出视频名称',
    'inputFile': '输入文件名称',
    'outputFile': '输出文件名称',
    'uxInput': '手动输入参数',
    'picInput': '从图片选取坐标点'
  },
  FILL: {
    JSON: new Set([
      'jobResourceFile'
    ]),
    TXT: new Set([
      'inputFile',
      'outputFile'
    ]),
    PNG: new Set([
      'inputPicture',
      'outputPicture',
      'jobResourcePicture'
    ]),
    MP4: new Set([
      'inputVideo',
      'outputVideo'
    ])
  },
  NOT_SHOW_AUTO_COMPLETE: new Set([
    'jobResourceFile',
    'jobResourcePicture',
    'picInput',
    'uxInput',
    'outputFile',
    'outputPicture',
    'outputVideo'
  ]),
  NOT_SHOW_INPUT: new Set([
    'inputPicture',
    'jobResourceFile',
    'jobResourcePicture',
    'inputVideo',
    'inputFile'
  ]),
  SHOW_SCREEN_SHOOT: new Set([
    'jobResourcePicture',
    'picInput'
  ]),
  IMGTOOL: new Set([
    'IMGTOOL',
    'COMPLEX'
  ]),
  OUTER_PALETTE_MODEL: [
    { category: 'switchBlock', text: 'Switch' },
    {
      category: 'normalBlock',
      text: 'Normal',
      unitLists: {
        'class': 'GraphLinksModel',
        'linkFromPortIdProperty': 'fromPort',
        'linkToPortIdProperty': 'toPort',
        'nodeDataArray': [{
          'category': 'Start',
          'text': 'Entry',
          'key': -1
        }, {
          'category': 'UnitList',
          'text': 'UnitList',
          'isGroup': true,
          'key': -2
        }, {
          'category': 'End',
          'text': 'Exit',
          'key': -3
        }],
        'linkDataArray': [{
          'from': -1,
          'to': -2,
          'fromPort': 'R',
          'toPort': 'L'
        }, {
          'from': -2,
          'to': -3,
          'fromPort': 'R',
          'toPort': 'L'
        }]
      }
    },
    { category: 'Job', text: 'Job' },
    { category: 'End', text: 'End' }
  ],
  BASIC_OUTER_DIAGRAM_MODEL: JSON.stringify({
    'class': 'GraphLinksModel',
    'linkFromPortIdProperty': 'fromPort',
    'linkToPortIdProperty': 'toPort',
    'nodeDataArray': [ { 'category': 'Start', 'text': 'Start', 'key': -1 } ],
    'linkDataArray': []
  }),
  SIMPLE_JOB_KEY: ['job_name', 'job_type', 'job_second_type', 'job_label', 'description', 'draft', 'subsidiary_device_count'],
  COMPLEX_JOB_KEY: ['test_area', 'android_version', 'custom_tag', 'phone_models', 'rom_version'],
  USER_INFO: ['id', 'username', 'groups', 'token'],
  SERIALIZER_KEY: ['manufacturer', 'androidVersion', 'customTag', 'testArea'],
  BASIC_DATA_KEYS: [
    {
      camelCase: 'testArea',
      underlineCase: 'job_test_area',
      orderCase: 'description'
    },
    {
      camelCase: 'customTag',
      underlineCase: 'custom_tag',
      orderCase: 'custom_tag_name'
    },
    {
      camelCase: 'reefUser',
      underlineCase: 'reefuser',
      orderCase: 'username'
    },
    {
      camelCase: 'phoneModel',
      underlineCase: 'phone_model',
      orderCase: 'phone_model_name'
    },
    {
      camelCase: 'androidVersion',
      underlineCase: 'android_version',
      orderCase: 'version'
    },
    {
      camelCase: 'romVersion',
      underlineCase: 'rom_version',
      orderCase: 'version'
    },
    {
      camelCase: 'manufacturer',
      underlineCase: 'manufacturer',
      orderCase: 'manufacturer_name'
    }
  ],
  NORMAL_DATA_KEY: ['text', 'star', 'color', 'unitLists', 'resFile', 'wingman'],
  DEFAULT_UNIT_DATA: {
    unitKey: undefined,
    unitName: undefined,
    unitType: undefined,
    unitMsg: null
  }
}
