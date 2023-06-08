<template>
  <div style="overflow-x: auto; overflow-y: auto; height: 90%;">
    <table>
        <th v-for="column in columns" :key="column.title">{{ column.title}}</th>
        <tr v-for="(row, trIndex) in data" :key="trIndex" @click="showFile(trIndex)" :class="{ active: trIndex === currentRow }">
            <td>{{ trIndex + 1 }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.type }}</td>
            <td>
                <Button type="error" @click.stop="removeFile(trIndex)">{{$t('public.btn_del')}}</Button>
            </td>
        </tr>
        <tr v-show="data.length === 0">
          <td colspan="4">{{$t('jobResFile.notices_6')}}</td>
        </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    columns: {
      type: Array,
      default () {
        return []
      }
    },
    data: {
      type: Array,
      default () {
        return []
      }
    },
    curFile: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      currentRow: this.curFile
    }
  },
  methods: {
    showFile (index) {
      this.currentRow = index
      this.$emit('showFile', index)
    },
    removeFile (index) {
      if (this.data.length - 1 === index) {
        this.showFile(index - 1)
      }else {
        this.showFile(index)
      }
      this.$emit("remove-resFile-copy",index)
      // this.$store.commit('files/handleResFiles', { action: 'removeResFile', data: index })
    }
  }
}
</script>

<style scoped>
table {
    width: 100%;
    margin-bottom: 24px;
    border-collapse: collapse;
    border-spacing: 0;
    empty-cells: show;
    border: 1px solid #e9e9e9;
}
table th {
    background: #f7f7f7;
    color: #5c6b77;
    font-weight: 600;
    white-space: nowrap;
}
table td, table th {
    padding: 8px 16px;
    border: 1px solid #e9e9e9;
    text-align: center;
}
tr:hover {
  background-color: #dcdcdc;
  /*color: #515a6e;*/
}
.active {
    background-color: #82b3db!important;
    color: #fff!important;
}
</style>
