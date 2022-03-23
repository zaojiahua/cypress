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
        <Button type="error" size="small" @click.stop.native="remove(index)" >Delete</Button>
      </template>
    </Table>
    <div class="file-info">
      <div class="recognition-rate">
        <Poptip trigger="focus">
          <Input v-model="imgRecRate" size="small" placeholder="请设定识别率">
            <span slot="prepend">识别率</span>
          </Input>
          <div slot="content">{{ `${this.imgRecRate}%` }}</div>
        </Poptip>
      </div>
    </div>
  </Card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'FeaturePoint',
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
      ]
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
      this.$store.commit('img/handleCoordinate', {
        action: 'remove',
        data: index
      })
    },
    showLabelArea (curRowData, index) {
      this.$store.commit('item/handleAreasInfo', {
        action: 'set',
        data: {
          data: this._.cloneDeep(curRowData),
          index
        }
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
      .recognition-rate {
        flex: 1;
        align-items: center;
        height: 24px;
        /deep/ .ivu-poptip {
          width: 100%;
          & > .ivu-poptip-rel {
            width: 100%;
          }
        }
      }
    }
  }
</style>
