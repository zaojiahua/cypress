<template>
    <div>
        <div class="sel-box" v-if="testIndex===0">
            <h3 class="sel-tip">请先确定用例类型</h3>
            <div style="text-align: center">
                <div class="sel-grey-box" style="margin-right: 30px;" @click="enterJobEditor('norMalJob')">
                    <Icon type="ios-filing" size="50" />
                    <p>通用用例</p>
                </div>
                <div class="sel-grey-box" @click="enterJobEditor('InnerJob')">
                    <Icon type="ios-filing-outline" size="50" />
                    <p>内嵌用例</p>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    export default {
        data() {
            return {
              testIndex:0,

            }
        },
        methods: {

            enterJobEditor(type) {
              this.$store.commit("job/setSelectJobType",type)
              this.$router.push({ name: 'jobEditor' })
              this.$store.commit('job/setJobFlowInfo', {order:0})
              // 清空失效的数据
              this.$store.commit('job/setOuterDiagramModel', null)
              this.$store.commit('files/handleResFiles', { action: 'clearResFiles' })

              setTimeout(() => {
                if (!this.isValidated) {
                  this.$store.commit('handleShowDrawer')
                }
              }, 600)


            }
        }
    }
</script>

<style scoped>
    .sel-box{
        background-color: #fff;
        height: calc(100vh - 100px);
        border-radius: 5px;
        box-shadow: rgb(242, 242, 242) 2px 2px 5px;
    }
    .sel-tip{
        padding-top: 150px;
        color: rgb(170, 170, 170);
        text-align: center;
    }
    .sel-grey-box{
        display: inline-block;
        padding-top: 15px;
        width: 120px;
        height: 120px;
        background-color: #f2f2f2;
        margin-top: 30px;
        color: #969696;
        cursor: pointer;
    }
    .sel-grey-box p{
        margin-top: 12px;
    }

</style>

