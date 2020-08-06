<template>
  <div :class="customClass">
    <custom-cell />
    <wd-popup v-model="popupShow" position="bottom" @click-modal="onCancel" :duration="250">
      <toolbar :target="currentTarget"></toolbar>
      <!-- 开始 -->
      <wd-picker-view
        ref="pickerView"
        v-model="innerValue"
        :type="dateType"
        :loading="loading"
        :filter="filter"
        :formatter="formatter"
        :arrow-html="arrowHtml"
        :value-key="valueKey"
        :label-key="labelKey"
        :min-date="minDate"
        :max-date="maxDate"
        :min-hour="minHour"
        :max-hour="maxHour"
        :max-minute="maxMinute"
        :min-minute="minMinute"
        :columns-height="columnsHeight"
        :column-formatter="region ? customColumnFormatter : null"
      />
      <!-- 结束 -->
      <!-- 如果有结束事件那么是范围选择模式，该模式仅在时间选择下有效 -->
      <div v-if="region">
        <slot name="region-separator">
          <div class="wd-picker__region-separator">至</div>
        </slot>
        <wd-picker-view
          ref="endPickerView"
          v-model="end.innerValue"
          :type="dateType"
          :loading="loading"
          :filter="filter"
          :formatter="formatter"
          :arrow-html="arrowHtml"
          :value-key="valueKey"
          :label-key="labelKey"
          :min-date="endMinDate"
          :max-date="endMaxDate"
          :min-hour="endMinHour"
          :max-hour="endMaxHour"
          :max-minute="endMaxMinute"
          :min-minute="endMinMinute"
          :columns-height="columnsHeight"
          :column-formatter="customColumnFormatter"
        />
      </div>
    </wd-popup>
  </div>
</template>
<script>
import pickerMixin from 'wot-design/src/mixins/picker'
import WdPickerView from 'wot-design/packages/datetime-picker-view'
import pickerViewProps from 'wot-design/packages/picker-view/src/pickerViewProps'
import datetimePickerViewProps from 'wot-design/packages/datetime-picker-view/src/datetimePickerProps'
import datetimeRangeProps from 'wot-design/packages/datetime-picker/src/datetimeRangeProps'
import pickerProps from 'wot-design/packages/picker/src/pickerProps'
import { padZero } from 'wot-design/src/utils'

export default {
  name: 'WdDatetimePicker',

  mixins: [pickerMixin],

  components: {
    WdPickerView
  },

  data () {
    return {
      timePicker: true,
      currentTarget: this,
      innerValue: this.region ? this.value[0] : this.value,
      displayColumns: [],
      end: {
        innerValue: this.value[1] || '',
        displayColumns: []
      }
    }
  },

  props: {
    value: null,
    // datetime / 'date' / 'year-month' / 'time' | datetimerange / 'daterange' / 'year-monthrange' / 'timerange'
    type: {
      type: String,
      default: 'datetime'
    },
    ...pickerViewProps,
    ...pickerProps,
    ...datetimePickerViewProps,
    ...datetimeRangeProps
  },
  computed: {
    region () {
      return this.type.substring(this.type.length - 5, this.type.length) === 'range'
    },
    dateType () {
      return this.region ? this.type.substring(0, this.type.length - 5) : this.type
    }
  },
  watch: {
    value: {
      handler (val, oldVal) {
        // 存在旧值，新值与 innerValue 相同，则不作处理
        if (oldVal && val.valueOf() === this.innerValue.valueOf()) return
        this.innerValue = this.region ? val[0] : val
        this.end.innerValue = val[1] || ''
      },
      immediate: true
    }
  },

  methods: {
    onConfirm () {
      if (this.loading) {
        this.closePopup()
        this.$emit('confirm')
        return
      }
      if (this.beforeConfirm) {
        this.beforeConfirm(this.region ? [this.innerValue, this.end.innerValue] : this.innerValue, isPass => {
          isPass && this.handleConfirm()
        })
      } else {
        this.handleConfirm()
      }
    },

    handleConfirm () {
      this.closePopup()

      this.$nextTick(() => {
        this.$emit('input', this.region ? [this.innerValue, this.end.innerValue] : this.innerValue)
        this.$emit('confirm')
        this.setShowValue()
      })
    },

    onCancel () {
      // reset innerValue
      // 格式化单个this.value.start
      this.innerValue = this.region ? this.value[0] : this.value
      this.end.innerValue = this.value[1] || ''
      this.closePopup()
      this.$emit('cancel')
    },
    defaultDisplayFormat (items) {
      if (items.length === 0) return ''
      if (this.displayFormat) {
        return this.displayFormat(items)
      }
      // 如果使用了自定义的的formatter，defaultDisplayFormat无效
      if (this.formatter) {
        const pickerView = this.$refs.pickerView.$refs.pickerView
        return pickerView.getLabels().join('')
      }
      switch (this.dateType) {
        case 'date':
          return `${items[0].label}-${items[1].label}-${items[2].label}`
        case 'year-month':
          return `${items[0].label}-${items[1].label}`
        case 'time':
          return `${items[0].label}:${items[1].label}`
        case 'datetime':
          return `${items[0].label}-${items[1].label}-${items[2].label} ${items[3].label}:${items[4].label}`
      }
    },

    setShowValue () {
      const pickerView = this.$refs.pickerView.$refs.pickerView
      const items = pickerView.getItems()
      let label = this.defaultDisplayFormat(items)

      if (this.region) {
        const endPickerView = this.$refs.endPickerView.$refs.pickerView
        const items1 = endPickerView.getItems()
        label = label + ' 至 ' + this.defaultDisplayFormat(items1)
      }
      this.showValue = label
    },

    /**
     * 区域选择time禁用规则
     * @param {String} type 时间段类型 start | end
     * @param {Array} column 当前遍历到的列数组
     * @param {Number} cindex 外层column的索引（对应每一个类型）
     * @param {Number / String} value 遍历到的当前值
     * @param {Array} currentValue 当前选中的值 this.pickerValue
     * @param {Array} boundary 当前变量的限制值，决定禁用的边界值
     */
    columnDisabledRules (type, columns, cIndex, value, currentValue, boundary, ranges) {
      // 0年 1月 2日 3時 4分
      // startPicker 除最小值外 还需要有一个时间限制, endPicker 时间选择后, startPicker 的 添加一个时间限制boundary min->boundary
      // endPicker 除最小值外 还需要有一个时间限制, startPicker 时间选择后, endPicker 的 添加一个时间限制boundary boundary->max
      const column = columns[cIndex]
      // 根据当前选择年确认 ranges[0][0] minYear ranges[0][1] maxYear 以此类推
      const year = boundary[0] || (type === 'end' ? ranges[0][0] : ranges[0][1])
      const month = boundary[1] || (type === 'end' ? ranges[1][0] : ranges[1][1])
      const date = boundary[2] || (type === 'end' ? ranges[2][0] : ranges[2][1])
      const hour = boundary[3] || (type === 'end' ? ranges[3][0] : ranges[3][1])
      const minute = boundary[4] || (type === 'end' ? ranges[4][0] : ranges[4][1])

      if (column.type === 'year') {
        return type === 'start' ? value > year : value < year
      }
      if (column.type === 'month' && currentValue[0] === year) {
        return type === 'start' ? value > month : value < month
      }
      if (column.type === 'date' && (currentValue[0] === year && currentValue[1] === month)) {
        return type === 'start' ? value > date : value < date
      }
      if (column.type === 'hour' && currentValue[0] === year && currentValue[1] === month && currentValue[2] === date) {
        return type === 'start' ? value > hour : value < hour
      }
      if (column.type === 'minute' && currentValue[0] === year && currentValue[1] === month && currentValue[2] === date && currentValue[3] === hour) {
        return type === 'start' ? value > minute : value < minute
      }

      return false
    },

    /**
     * 自定义列项筛选规则
     * @param {Vue} pickerView pickerView 实例
     * @param {Array} originColumns 选项数组
     * @param {Array} ranges pickerView 范围数组
     * @param {Date} value 当前 pickerView 实例传入值
     */
    customColumnFormatter (pickerView, originColumns, ranges, currentValue) {
      const start = this.innerValue
      const end = this.end.innerValue
      const type = currentValue === start ? 'start' : 'end'

      const boundary = type === 'start' ? pickerView.getPickerValue(end) : pickerView.getPickerValue(start)
      currentValue = pickerView.getPickerValue(currentValue)
      const mapColumns = (columns, type) => {
        // 此时index是最外层知道当前的索引即可得到当前是哪个时间段
        return columns.map((column, cIndex) => {
          return column.values.map((value, index) => {
            const disabled = this.columnDisabledRules(type, columns, cIndex, value, value, boundary, ranges)

            return {
              label: pickerView.formatter ? pickerView.formatter(column.type, padZero(value)) : padZero(value),
              value,
              disabled
            }
          })
        })
      }

      return mapColumns(originColumns, type)
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.setShowValue()
    })
  }
}
</script>
