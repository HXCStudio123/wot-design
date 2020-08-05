<template>
  <div :class="customClass">
    <custom-cell />
    <wd-popup v-model="popupShow" position="bottom" @click-modal="onCancel" :duration="250">
      <toolbar :target="currentTarget"></toolbar>
      <!-- 开始 -->
      <wd-picker-view
        ref="pickerView"
        v-model="pickerValue[0]"
        :columns="region ? displayColumns[0] : displayColumns"
        :loading="loading"
        :arrow-html="arrowHtml"
        :visible-item-count="visibleItemCount"
        :value-key="valueKey"
        :label-key="labelKey"
        :columns-height="columnsHeight"
        :column-change="onColumnChange"
      />
      <!-- 结束 -->
      <!-- 如果有结束事件那么是范围选择模式，该模式仅在时间选择下有效 -->
      <div v-if="region">
        <slot name="region-separator">
          <div class="wd-picker__region-separator">至</div>
        </slot>
        <wd-picker-view
          ref="endPickerView"
          v-model="pickerValue[1]"
          :columns="region ? displayColumns[1] : displayColumns"
          :loading="loading"
          :arrow-html="arrowHtml"
          :visible-item-count="visibleItemCount"
          :columns-height="columnsHeight"
          :value-key="valueKey"
          :label-key="labelKey"
          :column-change="onColumnChange"
        />
      </div>
    </wd-popup>
  </div>
</template>
<script>
import pickerMixin from 'wot-design/src/mixins/picker'
import WdPickerView from 'wot-design/packages/picker-view'
import DatetimePickerView from 'wot-design/src/mixins/datetimePickerView'

export default {
  name: 'WdDatetimePicker',
  mixins: [DatetimePickerView, pickerMixin],
  components: {
    WdPickerView
  },
  computed: {
    customClass () {
      const rootClass = ['wd-picker']
      this.error && rootClass.push('is-error')
      this.alignRight && rootClass.push('is-align-right')
      this.disabled && rootClass.push('is-disabled')
      this.size && rootClass.push(`is-${this.size}`)
      this.label | this.$slots.default && rootClass.push('is-cell')

      return rootClass.join(' ')
    }
  },
  methods: {
    onConfirm () {
      if (this.loading) {
        this.popupShow = false
        this.$emit('confirm')
        return
      }
      if (this.beforeConfirm) {
        this.beforeConfirm(this.innerValue, isPass => {
          isPass && this.handleConfirm()
        })
      } else {
        this.handleConfirm()
      }
    },
    handleConfirm () {
      this.popupShow = false
      this.$nextTick(() => {
        this.$emit('input', this.innerValue)
        this.$emit('confirm')
        const items = this.$refs.pickerView.getItems()
        const label1 = this.defaultDisplayFormat(items)
        this.showValue = label1
      })
    },
    onCancel () {
      // reset innerValue
      // 格式化单个this.value.start
      this.displayColumns = this.lastColumns
      this.innerValue = this.region ? this.formatRegion(this.value) : this.formatValue(this.value)
      this.popupShow = false
      this.$emit('cancel')
    },
    defaultDisplayFormat (items) {
      if (items.length === 0) return ''
      if (this.displayFormat) {
        return this.displayFormat(items)
      }
      // 如果使用了自定义的的formatter，defaultDisplayFormat无效
      if (this.formatter) {
        return this.getPickerView().getLabels().join('')
      }
      switch (this.type) {
        case 'date':
          return `${items[0].label}-${items[1].label}-${items[2].label}`
        case 'year-month':
          return `${items[0].label}-${items[1].label}`
        case 'time':
          return `${items[0].label}:${items[1].label}`
        case 'datetime':
          return `${items[0].label}-${items[1].label}-${items[2].label} ${items[3].label}:${items[4].label}`
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      const items = this.$refs.pickerView.getItems()
      const label1 = this.defaultDisplayFormat(items)
      this.showValue = label1
    })
  }
}
</script>
