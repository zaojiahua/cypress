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
    GROUP: '#50A5F4'
  },
  WILL_TOUCH_FILE: new Set([
    'jobResourceFile',
    'jobResourcePicture'
  ]),
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
    'inputFile',
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
    'inputVideo'
  ]),
  SHOW_SCREEN_SHOOT: new Set([
    'jobResourcePicture',
    'picInput'
  ])
}
