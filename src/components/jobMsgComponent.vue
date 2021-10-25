<template>
  <Drawer :closable="false" v-model="$store.state.showDrawer" width="45" @on-close="closeDrawer">
    <Tabs v-model="currTab" @on-click="showJobFlow" type="card">
      <TabPane name="jobAttr" label="用例属性信息">
        <Form ref="form"
              v-if="basicData"
              :model="$store.state.job.jobInfo"
              width="30" :label-width="95"
              label-position="left"
              :rules="validateRules">
          <FormItem label="用例名称" prop="job_name">
            <Input  :disabled="!editJobMsg"  v-model="$store.state.job.jobInfo.job_name" clearable placeholder="请输入用例名称"/>
          </FormItem>
          <FormItem label="测试用途" prop="test_area">
            <Select :disabled="!editJobMsg" v-model="$store.state.job.jobInfo.test_area" multiple placeholder="请选择" filterable allow-create>
              <Option v-for="item in basicData[basicData.testArea]" :value="item.id" :key="item.id">{{ item.description }}</Option>
            </Select>
          </FormItem>
          <FormItem label="用例类型" prop="job_type" class="type">
            <Cascader :disabled="!editJobMsg" :data="jobTypes[selectJobType]" v-model="curJobType"></Cascader>
            <Input v-model="jobTypeString" style="display: none;" disabled />
          </FormItem>
          <FormItem label="自定义标签" prop="custom_tag">
            <Select :disabled="!editJobMsg" v-model="$store.state.job.jobInfo.custom_tag" multiple placeholder="请选择" filterable allow-create>
              <Option v-for="item in basicData[basicData.customTag]" :value="item.id" :key="item.id">{{ item.custom_tag_name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="caseNo" prop="case_number">
            <Input :disabled="!editJobMsg" v-model="$store.state.job.jobInfo.case_number" clearable placeholder="请输入用例编号" />
          </FormItem>
          <FormItem label="priority" prop="priority">
            <Input :disabled="!editJobMsg" v-model="$store.state.job.jobInfo.priority" clearable placeholder="请输入用例级别" />
          </FormItem>
          <FormItem label="用例说明" prop="description">
            <Input :disabled="!editJobMsg" v-model="$store.state.job.jobInfo.description" clearable placeholder="请输入说明信息" />
          </FormItem>
          <Divider orientation="left" class="device-info-title" style="margin-top: 60px;">
            <b>设备信息</b>
            <Button v-if="editJobMsg" type="info" @click="onSelectDevice">选取设备</Button>
          </Divider>
          <FormItem label="厂商信息" prop="manufacturer">
            <Select :disabled="!editJobMsg" v-model="$store.state.job.jobInfo.manufacturer" placeholder="请选择" @on-change="clear" filterable :transfer="true">
              <Option v-for="item in basicData[basicData.manufacturer]" :value="item.id" :key="item.id">{{ item.manufacturer_name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="适配机型" prop="phone_models">
            <Select :disabled="!editJobMsg || disabled" v-model="$store.state.job.jobInfo.phone_models" multiple  placeholder="请选择" filterable :transfer="true">
              <Option v-for="item in curManufacturer.phonemodel" :value="item.id" :key="item.id">{{ item.phone_model_name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="ROM版本" prop="rom_version">
            <Select :disabled="!editJobMsg || disabled" v-model="$store.state.job.jobInfo.rom_version" multiple placeholder="请选择" filterable :transfer="true">
              <Option v-for="item in curManufacturer.romversion" :value="item.id" :key="item.id">{{ item.version }}</Option>
            </Select>
          </FormItem>
          <FormItem label="适配系统" prop="android_version">
            <Select :disabled="!editJobMsg" v-model="$store.state.job.jobInfo.android_version" multiple placeholder="请选择" :transfer="true">
              <Option v-for="item in basicData[basicData.androidVersion]" :value="item.id" :key="item.id">{{ item.version }}</Option>
            </Select>
          </FormItem>
          <div v-show="selectJobType !== 'InnerJob'">
            <Divider orientation="left" class="device-info-title" style="margin-top: 60px;">
              <b>资源信息</b>
            </Divider>
            <FormItem label="测试柜类型" prop="cabinet_type">
              <Select :disabled="!editJobMsg" v-model="$store.state.job.jobInfo.cabinet_type" :transfer="true">
                  <Option v-for="(item,index) in $store.state.job.cabinetList" :value="item" :key="index">{{ item }}</Option>
              </Select>
            </FormItem>
            <FormItem label="附加资源" prop="resource_list">
              <Cascader :disabled="!editJobMsg" v-model="$store.state.job.resourceList[i-1]" :data="cascaderData" filterable v-for="i in cascaderIndex" :key="i" :transfer="true" style="margin-bottom: 16px"></Cascader>
              <Button v-show="editJobMsg" type="primary" long @click="addResourceClick">
                <Icon type="ios-add-circle-outline" size="20" />
              </Button>
            </FormItem>
          </div>
          <div v-show="isJobEditor">
            <Divider orientation="left" class="device-info-title" style="margin-top: 60px;">
              <b>流程图信息</b>
            </Divider>
            <FormItem label="名称" prop="flow_name">
              <Input :disabled="!editJobMsg" v-model="jobFlowInfo.name" clearable placeholder="请输入名称" />
            </FormItem>

            <FormItem label="描述">
              <Input :disabled="!editJobMsg" v-model="jobFlowInfo.description" clearable placeholder="请输入描述信息" />
            </FormItem>
          </div>

          <div v-show="!isJobEditor" style="float: right;">
            <Button v-if="editJobMsg" type="success" @click="saveChange" style="margin-right: 1em">保存修改</Button>
            <Button v-if="selectJobType === 'InnerJob'" type="info" @click="enterJobEditor">开始编辑</Button>
          </div>
        </Form>
      </TabPane>
      <TabPane v-if="!isJobEditor && selectJobType === 'norMalJob'" name="jobFlow" label="用例流程图信息">
        <job-flow-component  ref="jobFlowCmp" v-show="!isJobEditor && selectJobType === 'norMalJob'" :job-id="jobInfo.job_id" @validate="validateForm"></job-flow-component>
      </TabPane>
    </Tabs>
    <job-device-select></job-device-select>
    <Modal v-model="isConflicted" :closable="false" :styles="{top: '42%'}" width="390">
      <div slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle" style="font-size: 20px;"></Icon>
        <span style="font-size: 18px;">设备信息冲突</span>
      </div>
      <div style="text-align:center;">
        <p style="margin: 20px 0;">当前选择的设备与已填信息冲突，请选择您要进行的操作</p>
      </div>
      <div slot="footer" style="display: flex; justify-content: space-between;">
        <Button @click="handleConflict">取消</Button>
        <div>
          <Button type="success" :disabled="!canAppend" @click="deviceInfoAppend">追加</Button>
          <Button type="primary" @click="deviceInfoReplace">替换</Button>
        </div>
      </div>
    </Modal>
  </Drawer>
</template>
<script>
import util from 'lib/util/validate.js'
import { jobSerializer } from 'lib/util/jobListSerializer'
import {controlDevice, getJobFlowList, getJobId, releaseOccupyDevice, updateJobMsg, getFlow, getCabinetList, getAppNameList, jobBindResource} from 'api/reef/request'
import jobDeviceSelect from '../components/jobDeviceSelect'
import jobFlowComponent from '../components/jobFlowComponent'
import { shouldCreateNewTag, createNewTag } from 'lib/tools'

import { mapState, mapGetters } from 'vuex'

const simChildren = [
  {
    value: '中国移动',
    label: '中国移动',
    children: [
      {
        value: 'volte_true',
        label: 'Volte',
      },
      {
        value: 'volte_false',
        label: '非Volte',
      }
    ]
  },
  {
    value: '中国联通',
    label: '中国联通',
    children: [
      {
        value: 'volte_true',
        label: 'Volte',
      },
      {
        value: 'volte_false',
        label: '非Volte',
      }
    ]
  },
  {
    value: '中国电信',
    label: '中国电信',
    children: [
      {
        value: 'volte_true',
        label: 'Volte',
      },
      {
        value: 'volte_false',
        label: '非Volte',
      }
    ]
  },
  {
    value: 'anything',
    label: '移动/联通/电信',
    children: [
      {
        value: 'volte_true',
        label: 'Volte',
      },
      {
        value: 'volte_false',
        label: '非Volte',
      }
    ]
  },
  {
    value: 'not_中国移动',
    label: '非中国移动',
    children: [
      {
        value: 'volte_true',
        label: 'Volte',
      },
      {
        value: 'volte_false',
        label: '非Volte',
      }
    ]
  },
  {
    value: 'not_中国联通',
    label: '非中国联通',
    children: [
      {
        value: 'volte_true',
        label: 'Volte',
      },
      {
        value: 'volte_false',
        label: '非Volte',
      }
    ]
  },
  {
    value: 'not_中国电信',
    label: '非中国电信',
    children: [
      {
        value: 'volte_true',
        label: 'Volte',
      },
      {
        value: 'volte_false',
        label: '非Volte',
      }
    ]
  },
  {
    value: 'nothing',
    label: '无卡'
  },
]

export default {
  name: 'jobMsgComponent',
  components: { jobDeviceSelect,jobFlowComponent },
  data () {
    const validatePass = async (rule, value, callback) => {
      if (!this.isJobEditor) {// 非jobEditor的校验不需要考虑jobFlow校验
        callback()
        return
      }
      // 获取不到value的值，不知为何
      console.log(this.jobFlowInfo)
      // 可能jobFlowInfo没有name字段
      let flow_name = this.jobFlowInfo.name ? this.jobFlowInfo.name.trim() : null
      if (!flow_name) {
        callback(new Error('请输入流程图名称'));
      }else if (flow_name.length > 70) {
        callback(new Error('流程图名称长度不能大于70个字符'));
      } else if (this.jobId)  { // 在已经存在的用例中操作
        let {data:{job_flows}} = await getFlow({job_id: this.jobId,name: flow_name})
        if (job_flows.length === 1 && job_flows[0].pk !== this.jobFlowInfo.id){
          callback(new Error('用例下的流程图名称重复'));
        } else {
          callback()
        }
      } else {
        callback()
      }
    };
    const validateCabinet = (rule, value, callback) => {
      if(this.selectJobType === 'InnerJob'){
        callback()
        return
      }
      if (!value || value === '') {
        callback(new Error('测试柜类型不能为空'));
      } else {
        callback();
      }
    };
    return {
      currTab: 'jobAttr',
      curManufacturer: {},
      /*
        curManufacturer, 存放当前选中机型的厂商信息, 以及该厂商名下的设备的机型/ROM版本信息
        {
          "id": xxx,
          "manufacturer_name": "Xiaomi",
          "phonemodel": [{ "id": xx, "phone_model_name": "polaris" }, ...],
          "romversion": [{ "id": 1, "version": "9.11.25" }, ...]
        }
      */
      disabled: true,
      validateRules: { // 表单验证规则
        job_name: [{
          required: true, message: '用例名称不能为空', trigger: 'blur,change'
        }, {
          type: 'string', max: 70, message: '用例名称不能超过70个字符', trigger: 'blur'
      }],
        test_area: [{
          required: true, type: 'array', min: 1, message: '测试用途不能为空', trigger: 'change'
        }],
        job_type: [{
          required: true, type: 'string', message: '用例类型不能为空', trigger: 'change'
        }],
        cabinet_type:[{
          required: true, validator:validateCabinet, trigger: 'change'
        }],
        manufacturer: [{
          required: true, type: 'number', message: '厂商信息不能为空', trigger: 'change'
        }],
        // 暂时去掉了对适配机型及Rom版本的表单验证
        // phone_models: [{
        //   required: true, type: 'array', min: 1, message: '适配机型不能为空', trigger: 'change'
        // }],
        // rom_version: [{
        //   required: true, type: 'array', min: 1, message: 'ROM版本不能为空', trigger: 'change'
        // }],
        android_version: [{
          required: true, type: 'array', min: 1, message: '适配系统不能为空', trigger: 'change'
        }],
        flow_name: [
          { required: true,validator: validatePass, trigger: 'blur' }
        ],
      },
      job: util.validate(jobSerializer, {}),
      isConflicted: false,
      jobTypes: { // 用例类型, 用于级联选择器
        InnerJob: [
          {
            value: 'InnerJob',
            label: '内嵌用例',
            children: []
          }
        ],
        norMalJob: [
          {
            value: 'Joblib',
            label: '功能测试',
            children: []
          },
          {
            value: 'PerfJob', // job_type
            label: '性能测试',
            children: [
              {
                value: 'TimeJob', // job_second_type
                label: '响应时间'
              },
              {
                value: 'SmoothJob',
                label: '流畅度'
              }
            ]
          }
        ]
      },
      curJobType: [],
      canAppend: true,
      // cabinetList:[],
      cascaderData:[
        {
          value: 'device',
          label: '主机',
          children: [
            {
              value: 'simcard_1',
              label: 'SIM卡1',
              children: simChildren,
            },
            {
              value: 'simcard_2',
              label: 'SIM卡2',
              children: simChildren,
            },
            {
              value: 'account_resource',
              label: '账号资源',
              children:[]
            }
          ]
        },
        //=========================================
        {
          value: 'subsidiary_device_1',
          label: '僚机1',
          children: [
            {
              value: 'simcard_1',
              label: 'SIM卡1',
              children: simChildren,
            },
            {
              value: 'simcard_2',
              label: 'SIM卡2',
              children: simChildren,
            },
            {
              value: 'account_resource',
              label: '账号资源',
              children:[]
            }
          ]
        },
        //============================
        {
          value: 'subsidiary_device_2',
          label: '僚机2',
          children: [
            {
              value: 'simcard_1',
              label: 'SIM卡1',
              children: simChildren,
            },
            {
              value: 'simcard_2',
              label: 'SIM卡2',
              children: simChildren,
            },
            {
              value: 'account_resource',
              label: '账号资源',
              children:[]
            }
          ]
        },
        //=======================
        {
          value: 'subsidiary_device_3',
          label: '僚机3',
          children: [
            {
              value: 'simcard_1',
              label: 'SIM卡1',
              children: simChildren,
            },
            {
              value: 'simcard_2',
              label: 'SIM卡2',
              children: simChildren,
            },
            {
              value: 'account_resource',
              label: '账号资源',
              children:[]
            }
          ]
        }
      ],
      cascaderIndex:1,
    }
  },
  computed: {
    ...mapState(['showDrawer', 'basicData']),
    ...mapState('job', ['jobInfo', 'duplicateId', 'duplicateLabel','jobFlowInfo','selectJobType','cabinetList','resourceList','isClearJobInfo']),
    ...mapGetters('job', ['jobId']),
    ...mapState('device', ['deviceInfo', 'preDeviceInfo', 'countdown', 'isControlDevice']),
    isJobEditor () { // 是否在 JobEditor 页面
      return this.$route.name === 'jobEditor'
    },
    editJobMsg() {
      return !(sessionStorage.groups && sessionStorage.groups.includes('Admin')) && (this.jobInfo.job_id === undefined ||this.jobInfo.author  === parseInt(sessionStorage.id))
    },
    editJobFlow (){
      return !(sessionStorage.groups && sessionStorage.groups.includes('Admin')) && (this.jobInfo.job_id === undefined ||this.jobInfo.author  === parseInt(sessionStorage.id))
    },
    isAdmin (){
      return sessionStorage.groups && sessionStorage.groups.includes('Admin')
    },
    manufacturer () {
      return this.basicData[this.basicData.manufacturer]
    },
    jobTypeString: {
      get: function () {
        return this.curJobType.join('/')
      },
      set: function (val) {

      }
    }
  },
  watch: {
    jobInfo (val) { // jobInfo(用例信息)变化是, 记录job的类型与二级类型
      console.log(this.jobInfo.job_id)
      if(this.isClearJobInfo){
        this.curJobType = []
        this.$store.commit('job/setIsClearJobInfo', false)
      }
      if (val.job_type) {
        this.curJobType.splice(0, 1, val.job_type)
      } else {
        this.curJobType.splice(0, 1)
      }
      if (val.job_second_type) {
        this.curJobType.splice(1, 1, val.job_second_type)
      } else {
        this.curJobType.splice(1, 1)
      }
    },
    resourceList(val){
      if(val.length>0)
        this.cascaderIndex = val.length
      else
        this.cascaderIndex = 1
    },
    showDrawer (val) { // 在jobEditor页面之外的页面关闭右侧抽屉时清除当前选中的用例信息
      this.currTab = "jobAttr"
      if(val){
        this.getcabinetList()
        this.$store.dispatch('setBasicData')
      }
      if (val === false && !this.isJobEditor) {
        this.$store.commit('job/handleJobInfo', { action: 'clearJobInfo' })
        this.curJobType = []
      }
    },
    deviceInfo (newVal, oldVal) { // 设备信息变化时检测是否和已填信息发生冲突并进行处理
      this.$store.commit('device/setPreDeviceInfo', oldVal)
      this.checkConflict(false, true)
    },
    'jobInfo.manufacturer' (val) { // 当厂商发生变动时刷新列表
      this.resetManufacturter()
    },
    curJobType (val) { // 没有就是undefined
      this.$set(this.jobInfo, 'job_type', val[0])
      if (val[1] === undefined) {
        this.$set(this.jobInfo, 'job_second_type', null)
      } else {
        this.$set(this.jobInfo, 'job_second_type', val[1])
      }
    }
  },
  methods: {
    showJobFlow (name) {
      switch (name) {
        case 'jobFlow':
          this.$refs.jobFlowCmp.refresh(this.jobId)
          break
      }
    },
    onSelectDevice(){
      this.$store.commit('device/setSelectDevice')
      this.$store.commit('device/setControlDeviceFlag')
    },
    async getcabinetList(){
      try {
        let { data } = await getCabinetList()
        // console.log(cabinetList)
        this.$store.commit('job/setCabinetList',data)
      } catch (error) {
        console.log(error)
      }
    },
    async enterJobEditor () { // 路由到jobEditor页面
      // this.$refs.form.validate((valid) => {
      // this.$store.commit('job/setIsValidated', valid)
      // })
      setTimeout(() => { // 延时关闭右侧抽屉
        this.$store.commit('handleShowDrawer')
        this.closeDrawer()
      }, 800)

      // if (this.duplicateId) {
      //   let { status } = await updateJobMsg(this.duplicateId, { job_deleted: true })
      //   if (status === 200) {
      //   } else {
      //     console.log('删除自动备份文件失败，错误码: ' + status)
      //   }
      // }

      // this.$store.commit('job/setDuplicateLabel',this.jobInfo.job_label) // todo：先屏蔽副本的代码，之后再做
      // let { data: { jobs } } = await getJobId(this.duplicateLabel)
      // if (jobs.length !== 0) { //表明存在
      //   this.$store.commit('job/setDuplicateId', jobs[0].id)
      // }else{
      //   this.$store.commit('job/setDuplicateId', null)
      // }
      //inner job 才有开始编辑的按钮
      let { data:{job_flow} } = await getJobFlowList(this.jobId)
      if (job_flow.length === 1){
        this.$store.commit('job/setJobFlowInfo', job_flow[0])
      }

      // 清空失效的数据
      this.$store.commit('job/setOuterDiagramModel', null)
      // this.$store.commit('job/handleJobInfo', { action: 'setPreJobInfo', data: false })
      this.$store.commit('files/handleResFiles', { action: 'clearResFiles' })

      if (this.countdown) { // 选取设备的时候, 检测和当前用例信息是否有冲突
        this.checkConflict(true, false)
      }

      this.$router.push({ // 跳转到 JobEditor
        name: 'jobEditor',
        query: {
          jobId: this.jobId
        }
      })
    },
    clear () { // 当厂商变化时清空 适配机型 与 ROM版本 信息
      this.jobInfo.phone_models = []
      this.jobInfo.rom_version = []
    },
    resetManufacturter () { // 重新设置厂商信息
      for (let i = 0; i < this.manufacturer.length; i++) {
        if (this.manufacturer[i].id === this.jobInfo.manufacturer) {
          this.curManufacturer = this.manufacturer[i]
          this.disabled = false
          break
        }
      }
    },
    async controlDevice () { // 选取设备
      if (this.preDeviceInfo) { // 如果之前选择的设备还没有到期则释放
        try {
          // eslint-disable-next-line camelcase
          let { id, device_name } = this.preDeviceInfo
          let { status } = await releaseOccupyDevice({
            device_id_list: [id]
          })
          if (status === 200) {
            this.$Message.success({
              background: true,
              // eslint-disable-next-line camelcase
              content: `成功释放设备 ${device_name}`
            })
            this.$store.commit('device/setCountdown')
          }
        } catch (error) {
          console.log(error)
        }
      }
      try { // 控制选中的设备
        // eslint-disable-next-line camelcase
        let { id, device_name } = this.deviceInfo
        let { status } = await controlDevice({
          device_id_list: [id],
          occupy_type: 'job_editor'
        })
        if (status === 200) {
          this.$Message.success({
            background: true,
            // eslint-disable-next-line camelcase
            content: `成功占用设备 ${device_name}`
          })
          this.$store.commit('device/setCountdown', true) // 显示倒计时
        }
      } catch (error) {
        console.log(error)
      }
    },
    saveChange () { // 保存对当前 Job 的修改
      if (!this.editJobMsg){
        this.$Message.error({
          background: true,
          content: '没有编辑当前用例的权限'
        })
        return
      }
      // 资源验证：先去除空值，看实际选择的资源value是否为空
      for (let i = this.resourceList.length-1; i >= 0; i--) {
        if(!this.resourceList[i] || this.resourceList[i].length===0)
          this.resourceList.splice(i,1)
      }
      //资源验证：每个设备(主僚机)下的sim1和sim2只能选择一次
      let sim_1_list = []
      let sim_2_list = []
      this.resourceList.forEach(item=>{
        if(item[1]==="simcard_1"){
          sim_1_list.push(item)
        }else if(item[1]==="simcard_2"){
          sim_2_list.push(item)
        }
      })
      let sim_1_name = []
      let sim_2_name = []
      sim_1_list.forEach(item=>{
        sim_1_name.push(item[0])
      })
      sim_2_list.forEach(item=>{
        sim_2_name.push(item[0])
      })
      let resourceList = _.cloneDeep(this.resourceList)
      if(this.isRepeat(sim_1_name)){
        this.$Message.warning({
          background: true,
          content: '每台设备仅能选择一张SIM1手机卡，请重新选择！'
        })
        return
      }
      if(this.isRepeat(sim_2_name)){
        this.$Message.warning({
          background: true,
          content: '每台设备仅能选择一张SIM2手机卡，请重新选择！'
        })
        return
      }
      this.$refs.form.validate(async (valid) => { // 表单验证
        if (shouldCreateNewTag('test_area', this.jobInfo)) { // 检测是否应该创建新的测试用途标签
          let data = await createNewTag('test_area', this.jobInfo) // 创建新的标签
          this.$store.dispatch('setBasicTestArea') // 更新基础信息中的测试用途
          setTimeout(() => {
            this.$store.commit('job/setJobTestArea', data)
          }, 400)
        }
        if (shouldCreateNewTag('custom_tag', this.jobInfo)) { // 同上
          let data = await createNewTag('custom_tag', this.jobInfo)
          this.$store.dispatch('setBasicCustomTag')
          setTimeout(() => {
            this.$store.commit('job/setJobCustomTag', data)
          }, 400)
        }
        if (valid) { // 通过验证
          setTimeout(() => {
            let jobInfo = this._.cloneDeep(this.jobInfo)
            jobInfo.author = parseInt(sessionStorage.id)
            updateJobMsg(this.jobId, jobInfo).then(() => { // 更新用例信息
              this.$Message.info('修改成功')
              this.$store.commit('refreshJobList')
              if(resourceList.length>0)
                jobBindResource( {"job_label":this.jobInfo.job_label,"resource_data":resourceList}).then(() => { // 更新用例信息
                  this.$Message.success('用例资源绑定成功')
                }).catch(error => {
                  console.log(error)
                  this.$Message.error('用例资源绑定失败')
                })
            }).catch(error => {
              console.log(error)
              this.$Message.error('修改失败')
            })
          }, 400)
        } else { // 验证失败
          this.$Message.warning({
            background: true,
            content: '请输入完整信息'
          })
        }
      })
    },
    handleConflict () { // 打开或关闭冲突处理面板
      this.isConflicted = !this.isConflicted
    },
    deviceInfoAppend () { // 发生冲突后将选取的设备信息追加
      if (!this.phoneModelFlag) this.jobInfo.phone_models.push(this.deviceInfo.phone_model_id)
      if (!this.romVersionFlag) this.jobInfo.rom_version.push(this.deviceInfo.rom_version_id)
      if (!this.androidVersionFlag) this.jobInfo.android_version.push(this.deviceInfo.android_version_id)
      if(this.isControlDevice)
        this.controlDevice()
      this.handleConflict()
    },
    deviceInfoReplace (toggle = true) { // 发生冲突后用选取的设备信息替换原设备信息
      if (!this.deviceInfo) return
      this.$set(this.jobInfo, 'manufacturer', this.deviceInfo.manufacturer_id)
      this.$set(this.jobInfo, 'phone_models', [])
      this.jobInfo.phone_models.push(this.deviceInfo.phone_model_id)
      this.$set(this.jobInfo, 'rom_version', [])
      this.jobInfo.rom_version.push(this.deviceInfo.rom_version_id)
      this.$set(this.jobInfo, 'android_version', [])
      this.jobInfo.android_version.push(this.deviceInfo.android_version_id)
      if(this.isControlDevice)
        this.controlDevice()
      if (toggle) this.handleConflict()
    },
    closeDrawer () { // 关闭右侧抽屉时检测当前 Job 是否通过验证，并更新 JobInfo
      if (this.isJobEditor) {
        this.$refs.form.validate((valid) => {
          console.log(valid)
          this.$store.commit('job/setIsValidated', valid)
          if (!valid) {
            this.$Message.warning({
              background: true,
              content: '请输入完整信息'
            })
          }
        })
      }
    },
    validateForm() {
      this.$refs.form.validate((valid) => {
        this.$store.commit('job/setIsValidated', valid)
      })
    },
    async checkConflict (formToggle, deviceToggle) { // 检测选中的设备和用例信息是否有冲突
      if (!this.jobInfo || !this.deviceInfo) return
      if (deviceToggle) { // 选取设备时
        if (!this.jobInfo.manufacturer) {
          this.deviceInfoReplace(false)
          return
        }
        if (this.jobInfo.manufacturer !== this.deviceInfo.manufacturer_id) { // 厂商不一样时只能替换
          this.canAppend = false
          this.handleConflict()
          return
        }
        // 厂商相同时, 检测其他内容是否相同
        let same = true
        this.canAppend = true
        this.phoneModelFlag = true
        this.romVersionFlag = true
        this.androidVersionFlag = true
        if (!this.jobInfo.phone_models.includes(this.deviceInfo.phone_model_id)) {
          this.phoneModelFlag = false
          same = false
        }
        if (!this.jobInfo.rom_version.includes(this.deviceInfo.rom_version_id)) { // 检测 ROM 版本是否冲突
          this.romVersionFlag = false
          same = false
        }
        if (!this.jobInfo.android_version.includes(this.deviceInfo.android_version_id)) { // 检测适配系统是否冲突
          this.androidVersionFlag = false
          same = false
        }
        if (!same) { // 有冲突则进行处理
          this.handleConflict()
        } else { // 无冲突则控制当前设备
          if(this.isControlDevice) this.controlDevice()
        }
      }
      if (formToggle) { // 手动更新表单信息时
        if (!this.deviceInfo) return
        if (
          this.jobInfo.manufacturer !== this.deviceInfo.manufacturer_id ||
          !this.jobInfo.phone_models.includes(this.deviceInfo.phone_model_id) ||
          !this.jobInfo.rom_version.includes(this.deviceInfo.rom_version_id) ||
          !this.jobInfo.android_version.includes(this.deviceInfo.android_version_id)
        ) {
          let { status } = await releaseOccupyDevice({
            device_id_list: [this.deviceInfo.id]
          })
          if (status === 200) {
            this.$Message.warning({
              background: true,
              content: '当前设备与 Job 冲突，已自动释放。'
            })
          }
          this.$store.commit('device/setCountdown') // 取消计时
        }
      }
    },
    addResourceClick(){
      this.cascaderIndex++
    },
    isRepeat(arr){
      let hash = {};
      for(let i in arr) {
        if(hash[arr[i]])
          return true;
        hash[arr[i]] = true;
      }
      return false;
    },
    // selectChange(value){
    //   this.$store.commit('job/handleJobInfo', {action: 'setJobInfo', data: this.jobInfo })
    // }
  },
  mounted () {
    if (!this.basicData) this.$store.dispatch('setBasicData') // 挂载时如果没有基本信息, 则获取
    let appChildren = []
    let subsidiaryAppChildren = []
    getAppNameList().then(response=>{
      response.data.result.forEach(app=>{
        appChildren.push({value:app.name,label:app.name})
        subsidiaryAppChildren.push({value:app.name,label:app.name,children:[{value:"account_alike_true",label:"与主机相同"},{value:"unrestrained",label:"无特殊要求"}]})
      })
      this.cascaderData.forEach(item=> {
        if(item.label === "主机")
          item.children[2].children = appChildren
        else
          item.children[2].children = subsidiaryAppChildren
      })
    }).catch(error=>{
      this.$Message.error({content:"获取app列表失败"+ error.response.data.message,duration:3})
    })
  }
}
</script>

<style lang="less" scoped>
@import '../css/common.less';
  .device-info-title {
    position: relative;

    Button {
      position: absolute;
      right: 0;
      top: -2px;
      z-index: 2;
    }
  }
.ivu-divider-horizontal.ivu-divider-with-text-left:after,
.ivu-divider-horizontal.ivu-divider-with-text-left:before{
  transform: none;
}
  // .type {
  //   /deep/ & > .ivu-form-item-content {
  //     display: flex;
  //     justify-content: space-between;
  //     align-items: center;
  //   }
  // }
</style>
