<template>
  <div>
    <demo-block title="基本用法" transparent>
      <wd-select-picker label="基本用法" :value="value1" :dataset="dataset1"></wd-select-picker>
      <wd-select-picker label="单选" :value="value2" type="radio" :dataset="dataset1"></wd-select-picker>
      <wd-select-picker label="禁用" :value="value3" :dataset="dataset1" disabled></wd-select-picker>
      <wd-select-picker label="只读" :value="value4" :dataset="dataset1" readonly></wd-select-picker>
      <wd-select-picker label="禁用选项" :value="value5" :dataset="dataset2"></wd-select-picker>
      <wd-select-picker label="展示格式化" :value="value6" :dataset="dataset1" disabled></wd-select-picker>
      <wd-select-picker label="标题" :value="value7" :dataset="dataset1" title="多选"></wd-select-picker>
      <wd-select-picker label="错误" :value="value8" :dataset="dataset1" error></wd-select-picker>
      <wd-select-picker label="必填" :value="value9" :dataset="dataset1" required></wd-select-picker>
      <wd-select-picker label="值靠右展示" :value="value9" :dataset="dataset1" align-right></wd-select-picker>
    </demo-block>
    <demo-block title="插槽">
      <wd-select-picker label="内容插槽">
        <wd-button type="primary">默认唤起项</wd-button>
        <div slot="content" class="showdemo">仅作为展示</div>
      </wd-select-picker>
    </demo-block>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dataset1: [
        {
          value: '1',
          label: '京麦1'
        },
        {
          value: '2',
          label: '京麦2'
        },
        {
          value: '3',
          label: '京麦3'
        }
      ],
      dataset2: [
        {
          value: '1',
          label: '京麦1',
          disabled: true
        },
        {
          value: '2',
          label: '京麦2'
        },
        {
          value: '3',
          label: '京麦3'
        }
      ],
      value1: ['1'],
      value2: '1',
      value3: [],
      value4: ['1'],
      value5: [],
      value6: [],
      value7: [],
      value8: [],
      value9: []
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.showdemo {
  text-align: center;
  padding: 25px;
}
</style>
