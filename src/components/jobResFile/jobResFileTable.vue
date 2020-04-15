<template>
    <table>
        <th v-for="column in columns" :key="column.title">{{ column.title}}</th>
        <tr v-for="(row, trIndex) in data" :key="trIndex" @click="showFile(trIndex)" :class="{ active: trIndex === currentRow }">
            <td>{{ trIndex }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.type }}</td>
            <td>
                <Button type="error" @click.stop="removeFile(trIndex)">删除</Button>
            </td>
        </tr>
        <tr v-show="data.length === 0">
          <td colspan="4">没有更多数据了</td>
        </tr>
    </table>
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
    currentFile: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      currentRow: this.currentFile
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
      }
      this.$store.commit('removeResFile', index)
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
  background-color: #82b3db;
  color: white;
}
.active {
    background-color: #82b3db;
    color: #fff;
}
</style>
