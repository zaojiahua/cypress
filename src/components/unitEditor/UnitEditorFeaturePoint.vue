<template>
  <Card class="feature-point-container">
    <!-- title -->
    <p slot="title">
      <Divider orientation="left" style="margin: 0;">选取特征点</Divider>
    </p>
    <!-- body -->
    <Table
      :columns="coordinateColumn"
      :data="coordinates"
      border
      max-height="556"
      size="small"
      @on-row-click="showLabelArea"
    >
      <template slot-scope="{ row, index }" slot="action">
        <Button type="error" size="small" @click.stop.native="remove(index)" :disabled="coordinates.length === 1">Delete</Button>
      </template>
    </Table>
    <div class="file-info">
      <div class="file-name">
        <Tag color="blue" size="small" class="tag">文件名称</Tag>
        <Input
          placeholder="为选取的特征点们取一个名字吧"
          @input="handleAreaFileName"
          v-model="curAreaFileName"
          style="flex: 1;"
          size="small"
          clearable
        ></Input>
      </div>
      <div class="recognition-rate">
        <Tag color="blue" size="small" class="tag">识别率</Tag>
        <InputNumber
          :max="100"
          :min="0"
          v-model="imgRecRate"
          style="flex: 1;"
          placeholder="识别率标准..."
          :formatter="value => `${value}%`"
          :parser="value => value.replace('%', '')"
          size="small"
        ></InputNumber>
      </div>
    </div>
  </Card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'FeaturePoint',
  props: {
    areaFileName: Object
  },
  data () {
    return {
      coordinateColumn: [
        {
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          title: 'coordinate_A',
          key: 'coordinate_a',
          align: 'center'
        },
        {
          title: 'coordinate_B',
          key: 'coordinate_b',
          align: 'center'
        },
        {
          title: 'Action',
          slot: 'action',
          width: 150,
          align: 'center'
        }
      ],
      curAreaFileName: this.areaFileName.main
    }
  },
  computed: {
    ...mapState('img', [
      'coordinates'
    ]),
    imgRecRate: {
      get () {
        return this.$store.state.img.imgRecRate * 100
      },
      set (val) {
        this.$store.commit('img/setImgRecRate', (val / 100).toFixed(4))
      }
    }
  },
  methods: {
    remove (index) {
      this.$store.commit('img/removeCoordinate', index)
    },
    handleAreaFileName () {
      this.$emit('handleAreaFileName', this.curAreaFileName)
    },
    showLabelArea (currentRowData, index) {
      this.$store.commit('item/setAreasInfo', {
        data: this._.cloneDeep(currentRowData),
        index
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .feature-point-container {
     /deep/ .ivu-card-head {
      border-bottom: 0;
      & > .ivu-divider {
        margin: 0;
      }
    }
    /deep/ .ivu-card-body {
      padding: 0 1em 1em;
      & > * {
        margin-bottom: 1em;
      }
      & > div:last-child {
        margin-bottom: 0;
      }
    }
    .file-info {
      display: flex;
      justify-content: space-between;
      .file-name {
        display: flex;
        flex: 1;
        justify-content: space-between;
        align-items: center;
        margin-right: 20px;
      }
      .recognition-rate {
        display: flex;
        flex: 1;
        align-items: center;
      }
    }
  }
</style>
