export default {
  STAR: new Set([
    'IMGTOOL',
    'COMPLEX'
  ]),
  COLORS: {
    START: '#064973',
    SWITCH: '#768BB9',
    NORMAL: '#F76132',
    COMBO: '#F76132',
    JOB: '#50A5F4',
    END: '#313131',
    FAIL: '#ec9139',
    SUCCESS: '#F65A6D',
    ABNORMAL: '#818286',
    TERMINATE: '#67718A',
    FINISH: '#29BB87',
    UNFINISHED: '#F76132',
    FINISH_COMBO: '#1ABCB8',
    UNIT: '#338FF0',
    GROUP: '#50A5F4',
    RESULT: '#3AFFF3', // 作为最终结果的unit
    STAR: '#ffff00' // 会产生结果对的unit
  },
  WILL_TOUCH_FILE: new Set([
    'jobResourceFile',
    // 'jobResourcePicture',
    'jobResourceFileWithDefaultValue'
  ]),
  WILL_TOUCH_NAME: {
    'outputFile': '文件名称',
    'outputPicture': '图片名称',
    'outputVideo': '视频名称'
  },
  JOB_DEFAULT_CONFIG: {
    finalResultKey: null, // 默认没有结果unit ,格式为 "NorBlockKey,UnitKey"
    byProductsName: [
      {'title': '文件名称', 'key': 'outputFile', 'children': []},
      {'title': '图片名称', 'key': 'outputPicture', 'children': []},
      {'title': '视频名称', 'key': 'outputVideo', 'children': []}
    ]
  },
  ITEM_DESC: {
    'jobResourceFile': '图片配置文件',
    'jobResourceFileWithDefaultValue': '带有默认值的图片配置文件',
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
  SHOW_INPUT: new Set([
    'outputPicture',
    'outputVideo',
    'outputFile',
    'uxInput',
    'picInput'
  ]),
  SHOW_AUTO_COMPLETE: new Set([
    'inputPicture',
    'inputVideo',
    'inputFile'
  ]),
  SHOW_SCREEN_SHOOT: new Set([
    'jobResourcePicture',
    'picInput',
    'jobResourceFileWithDefaultValue'
  ]),
  SHOW_FEATURE_POINT: new Set([
    'jobResourceFile',
    'jobResourceFileWithDefaultValue'
  ]),
  FILL: {
    JSON: new Set([
      'jobResourceFile',
      'jobResourceFileWithDefaultValue'
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
  IMGTOOL: new Set([
    'IMGTOOL',
    'COMPLEX'
  ]),
  OUTER_PALETTE_MODEL: [
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
    { category: 'switchBlock', text: 'Switch' },
    { category: 'Abnormal', text: 'Abnormal' },
    { category: 'Success', text: 'Success' },
    { category: 'Fail', text: 'Fail' },
    { category: 'End', text: 'End' }
  ],
  OUTER_PALETTE_MODEL_WITH_COMBO: [
    {
      category: 'comboBlock',
      text: 'Combo',
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
    { category: 'switchBlock', text: 'Switch' },
    { category: 'Abnormal', text: 'Abnormal' },
    { category: 'Success', text: 'Success' },
    { category: 'Fail', text: 'Fail' },
    { category: 'End', text: 'End' }
  ],
  OUTER_PALETTE_MODEL_WITH_TERMINATE:[   //自己决定是否需要Terminate终点
    { category: 'Terminate', text: 'Terminate' }
  ],
  BASIC_OUTER_DIAGRAM_MODEL: JSON.stringify({
    'class': 'GraphLinksModel',
    'linkFromPortIdProperty': 'fromPort',
    'linkToPortIdProperty': 'toPort',
    'nodeDataArray': [ { 'category': 'Start', 'text': 'Start', 'key': -1 } ],
    'linkDataArray': []
  }),
  SIMPLE_JOB_KEY: ['job_name', 'job_type', 'job_second_type', 'job_label','priority','case_number', 'description', 'draft'],
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
  },
  ICON_TEST_UNIT_LIST: [
    'has_icon',
  ],
  ICON_POSITION_TEST_UNIT_LIST:[   //  2
    'smart_icon_point_crop','smart_icon_point','smart_icon_long_press','end_point_with_icon','start_point_with_point','has_icon_area_selected'
  ],
  ICON_POSITION_FIX_TEST_UNIT_LIST:[   //1
    'smart_icon_point_crop_template',"start_point_with_point_template",'has_icon_template_match','end_point_with_icon_template_match'],
  ICON_TEST_UNIT_LIST_FIXED: [],
  UNIT_NOT_EXEC: [
    "end_point_with_icon_template_match","end_point_with_icon","end_point_with_changed","end_point_with_fps_lost","has_words","realtime_picture_compare","smart_ocr_point"
  ],
  //这部分是unit类型与适配几型柜的映射，注意数据库里的unit_group不代表适配几型号柜
  UNIT_MAPPING_DICT: {
    "Tcab_1": [1, 2],
    "Tcab_2": [1, 2],
    "Tcab_3": [1, 2, 3],
    "Tcab_3C": [1, 3, 4],
    "Tcab_4": [1, 2, 4],
    "Tcab_5": [1, 4, 5, 6],
    "Tcab_5L": [1, 4, 5, 6],
    "Tcab_5se": [1, 4, 5],
    "Tcab_5D": [1, 4, 5, 7],
    "Tcab_5pro":[1, 4, 5, 6]

  },
  UNIT_GROUP_DICT:{
    "3":"旋转机械臂",
    "4":"龙门架机械臂",
    "5":"摄像头",
    "6":"usb通断",
    "7":"双指",
  }
}

/*
* has_icon_area_selected 确认图标存在-2
* smart_icon_point_crop 点击图标-2,
* smart_icon_long_press：长按图标,
* end_point_with_icon：性能测试终点（图标出现-2）
* start_point_with_point：性能测试起点（点击瞬间-2）
* smart_icon_point_crop_template：点击图标-1,
* start_point_with_point_template：性能测试起点（点击瞬间-1）
* end_point_with_icon_template_match：性能测试终点（图标出现-1）
* has_icon_template_match 确认图标存在-1
* end_point_with_changed：性能测试终点（屏幕变化）
*/
