import { padZero, range } from 'wot-design/src/utils'
import pickerViewProps from '../../packages/picker-view/src/pickerViewProps'

const times = (num, formatter) => {
  let index = -1
  let array = []

  while (++index < num) {
    array.push(formatter(index))
  }

  return array
}

const currentYear = new Date().getFullYear()

const getMonthEndDay = (year, month) => {
  return 32 - new Date(year, month - 1, 32).getDate()
}
export default {
  data () {
    // 初始化值
    return {
      // 格式化初始值（当前选中值）
      innerValue: this.region ? this.formatRegion(this.value) : this.formatValue(this.value),
      // 日期选项数组，将日期拆分成picker的每一列的选项
      pickerValue: this.getPickerValue(this.value)
    }
  },
  props: {
    ...pickerViewProps,
    // datetime / 'date' / 'year-month' / 'time' | datetimerange / 'daterange' / 'year-monthrange' / 'timerange'
    type: {
      type: String,
      default: 'datetime'
    },
    value: null,
    filter: Function,
    formatter: Function,
    columnFormatter: Function,
    minHour: {
      type: Number,
      default: 0
    },
    maxHour: {
      type: Number,
      default: 23
    },
    minMinute: {
      type: Number,
      default: 0
    },
    maxMinute: {
      type: Number,
      default: 59
    },
    minDate: {
      type: Date,
      default: () => new Date(currentYear - 10, 0, 1)
    },
    maxDate: {
      type: Date,
      default: () => new Date(currentYear + 10, 11, 31)
    }
  },
  computed: {
    // 年月日时分秒区间设置
    ranges () {
      if (this.type === 'time') {
        return [
          {
            type: 'hour',
            range: [this.minHour, this.maxHour]
          }, {
            type: 'minute',
            range: [this.minMinute, this.maxMinute]
          }
        ]
      }

      return this.region ? [
        this.getRangesList(this.innerValue[0]),
        this.getRangesList(this.innerValue[1])
      ] : this.getRangesList(this.innerValue)
    },
    originColumns () {
      /**
       * 获取 每个时间类型的最大最小值 范围， 计算出当前的源 Columns
       * 获取时间范围时 startPicker endPicker 中
       * 开始选择器中的时间，每一个都是 endPicker 的最小时间（disabledIndex)
       * 禁用项 minLine -> disabledIndex
       */
      const mapRange = (ranges, type) => {
        return ranges.map(({ type, range }) => {
          let values = times(range[1] - range[0] + 1, index => {
            return range[0] + index
          })

          if (this.filter) {
            values = this.filter(type, values)
          }

          return {
            type,
            values
          }
        })
      }
      const start = this.region ? mapRange(this.ranges[0], 'start') : mapRange(this.ranges)
      const end = this.region ? mapRange(this.ranges[1], 'end') : ''
      return this.region ? [start, end] : start
    },
    columns () {
      const mapColumns = (columns, type) => {
        // 此时index是最外层知道当前的索引即可得到当前是哪个时间段
        return columns.map((column, cindex) => {
          return column.values.map((value, index) => {
            const disabled = this.region && (type === 'start' || type === 'end') ? this.regionFilterRules(type, columns, cindex, index, value) : false

            return {
              label: this.formatter ? this.formatter(column.type, padZero(value)) : padZero(value),
              value,
              disabled
            }
          })
        })
      }
      if (this.region) {
        return [
          mapColumns(this.originColumns[0], 'start'),
          mapColumns(this.originColumns[1], 'end')
        ]
      } else {
        return mapColumns(this.originColumns)
      }
    }
  },
  watch: {
    value: {
      handler (val, oldVal) {
        // 存在旧值，新值与 innerValue 相同，则不作处理
        // console.log('更改了', val, this.innerValue, oldVal && val.valueOf() === this.innerValue.valueOf())
        if (oldVal && val.valueOf() === this.innerValue.valueOf()) return
        // 格式化新值
        val = this.region ? [this.formatValue(val[0]), this.formatValue(val[1])] : this.formatValue(val)
        // 当前 value 赋值
        this.innerValue = val
        // 每一列选择器数据赋值
        this.pickerValue = this.getPickerValue(val)
      },
      immediate: true
    },
    columns: {
      handler () {
        this.updateColumnValues()
      },
      immediate: true
    },
    maxDate: 'updateInnerValue',
    minDate: 'updateInnerValue'
  },

  methods: {
    /**
     * 区域选择time规则
     * @param {String} type 时间段类型 start | end
     * @param {Array} column 当前数组
     * @param {Number} cindex 外层column的索引
     * @param {Number} index 当前值的在column索引
     * @param {Number / String} value 当前值
     */
    regionFilterRules (type, columns, cIndex, index, value) {
      // 0年 1月 2日 3時 4分
      // startPicker 除最小值外 还需要有一个时间限制, endPicker 时间选择后, startPicker 的 添加一个时间限制limit min->limit
      // endPicker 除最小值外 还需要有一个时间限制, startPicker 时间选择后, endPicker 的 添加一个时间限制limit limit->max
      const currentValue = {
        start: this.getValueArray(this.innerValue[0]),
        end: this.getValueArray(this.innerValue[1])
      }
      const limit = type === 'start' ? currentValue.end : currentValue.start
      const column = columns[cIndex]
      // 根据当前选择年确认
      const year = limit[0] || (type === 'end' ? this.minYear : this.maxYear)
      const month = limit[1] || (type === 'end' ? this.minMonth : this.maxMonth)
      const date = limit[2] || (type === 'end' ? this.minDate : this.maxDate)
      const hour = limit[3] || (type === 'end' ? this.minHour : this.maxHour)
      const minute = limit[4] || (type === 'end' ? this.minMinute : this.maxMinute)

      if (type === 'start') {
        if (column.type === 'year') {
          return value > year
        }
        if (column.type === 'month') {
          return currentValue.start[0] === year && (value > month)
        }
        if (column.type === 'date') {
          if (currentValue.start[0] === year && currentValue.start[1] === month) {
            return value > date
          }
        }
        if (column.type === 'hour') {
          if (currentValue.start[0] === year && currentValue.start[1] === month && currentValue.start[2] === date) {
            return value > hour
          }
        }
        if (column.type === 'minute') {
          if (currentValue.start[0] === year && currentValue.start[1] === month && currentValue.start[2] === date && currentValue.start[3] === hour) {
            return value > minute
          }
        }
      } else if (type === 'end') {
        if (column.type === 'year') {
          return value < year
        }
        if (column.type === 'month') {
          if (currentValue.end[0] === year) {
            return value < month
          }
        }
        if (column.type === 'date') {
          if (currentValue.end[0] === year && currentValue.end[1] === month) {
            return value < date
          }
        }
        if (column.type === 'hour') {
          if (currentValue.end[0] === year && currentValue.end[1] === month && currentValue.end[2] === date) {
            return value < hour
          }
        }
        if (column.type === 'minute') {
          if (currentValue.end[0] === year && currentValue.end[1] === month && currentValue.end[2] === date && currentValue.end[3] === hour) {
            return value < minute
          }
        }
      }
      return false
    },
    // 获取区间范围列表
    getRangesList (value) {
      const { maxYear, maxMonth, maxDate, maxHour, maxMinute } = this.getBoundary('max', value)
      const { minYear, minMonth, minDate, minHour, minMinute } = this.getBoundary('min', value)
      const result = [
        {
          type: 'year',
          range: [minYear, maxYear]
        }, {
          type: 'month',
          range: [minMonth, maxMonth]
        }, {
          type: 'date',
          range: [minDate, maxDate]
        }, {
          type: 'hour',
          range: [minHour, maxHour]
        }, {
          type: 'minute',
          range: [minMinute, maxMinute]
        }
      ]

      if (this.type === 'date') result.splice(3, 2)

      if (this.type === 'year-month') result.splice(2, 3)

      return result
    },
    formatRegion (value) {
      return [
        this.formatValue(value[0]),
        this.formatValue(value[1])
      ]
    },
    // 将当前的 value 格式化后，按照年月日时分秒拆分成数组
    getPickerValue (value) {
      if (this.region) {
        const start = value[0] ? this.getValueArray(this.formatValue(value[0])) : ''
        const end = value[1] ? this.getValueArray(this.formatValue(value[1])) : ''
        return [start, end]
      } else {
        return value ? this.getValueArray(this.formatValue(value)) : ''
      }
    },
    formatDisplay (items) {
      if (this.displayFormat) return this.displayFormat(items)

      if (this.type !== 'time') {
        return items.length === 2
          ? `${items[0].value}-${padZero(items[1].value)}`
          : items.length === 3
            ? `${items[0].value}-${padZero(items[1].value)}-${padZero(items[2].value)}`
            : `${items[0].value}-${padZero(items[1].value)}-${padZero(items[2].value)} ${padZero(items[3].value)}:${padZero(items[4].value)}`
      }

      return `${padZero(items[0].value)}:${padZero(items[1].value)}`
    },
    // 格式化当前日期 value
    formatValue (value) {
      // 显示小时：分钟
      if (this.type === 'time') {
        // 如果值为空，那么设置当前值为 最小时分
        if (!value) {
          value = `${padZero(this.minHour)}:${padZero(this.minMinute)}`
        }

        // 拆分时分 xx:xx -> [hour, minute]
        let [hour, minute] = value.split(':')
        // 控制 hour, minute 范围
        hour = padZero(range(hour, this.minHour, this.maxHour))
        minute = padZero(range(minute, this.minMinute, this.maxMinute))

        return `${hour}:${minute}`
      }
      // value 值不为date类型 或 无效日期，设置值为最小日期
      if (Object.prototype.toString.call(value) !== '[object Date]' || isNaN(value.getTime())) {
        value = this.minDate
      }

      // 取有效日期
      value = range(value.getTime(), this.minDate.getTime(), this.maxDate.getTime())

      // 转换为date格式
      return new Date(value)
    },
    /**
     * 获取边界分界线
     * @param {String} type 边界类型 value = max / min
     * @param {string / date} value 要处理的日期
     */
    getBoundary (type, value) {
      const boundary = this[`${type}Date`]
      // 拆分年月日时分
      const year = boundary.getFullYear()
      let month = 1
      let date = 1
      let hour = 0
      let minute = 0

      if (type === 'max') {
        month = 12
        date = getMonthEndDay(value.getFullYear(), value.getMonth() + 1)
        hour = 23
        minute = 59
      }

      if (value.getFullYear() === year) {
        month = boundary.getMonth() + 1

        if (value.getMonth() + 1 === month) {
          date = boundary.getDate()

          if (value.getDate() === date) {
            hour = boundary.getHours()

            if (value.getHours() === hour) {
              minute = boundary.getMinutes()
            }
          }
        }
      }

      return {
        [`${type}Year`]: year,
        [`${type}Month`]: month,
        [`${type}Date`]: date,
        [`${type}Hour`]: hour,
        [`${type}Minute`]: minute
      }
    },
    // 更新inner
    updateInnerValue () {
      const pickerView = this.$refs.pickerView || this.$getPickerView()
      let values = ''

      if (this.region) {
        const endPickerView = this.$refs.endPickerView || this.getPickerView(false)
        values = [pickerView.getValues(), endPickerView.getValues()]
      } else {
        values = pickerView.getValues()
      }

      if (this.type === 'time') {
        this.innerValue = this.region ? [
          `${padZero(values[0][0])}:${padZero(values[0][1])}`,
          `${padZero(values[1][0])}:${padZero(values[1][1])}`
        ] : `${padZero(values[0])}:${padZero(values[1])}`
        return
      }

      // 处理年份 索引位0
      const year = this.region ? [
        values[0] && values[0][0] && parseInt(values[0][0]),
        values[1] && values[1][0] && parseInt(values[1][0])
      ] : values[0] && parseInt(values[0])

      // 处理月 索引位1
      const month = this.region ? [
        values[0] && values[0][1] && parseInt(values[0][1]),
        values[1] && values[1][1] && parseInt(values[1][1])
      ] : values[1] && parseInt(values[1])

      const maxDate = this.region ? getMonthEndDay(year[0], month[0]) : getMonthEndDay(year, month)
      const endMaxDate = this.region ? getMonthEndDay(year[1], month[1]) : ''

      // 处理 date 日期 索引位2
      let date = this.region ? [1, 1] : 1
      if (this.type !== 'year-month') {
        if (this.region) {
          date = [
            (values[0][2] && parseInt(values[0][2])) > maxDate ? maxDate : (values[0][2] && parseInt(values[0][2])),
            (values[1][2] && parseInt(values[1][2])) > endMaxDate ? endMaxDate : (values[1][2] && parseInt(values[1][2]))
          ]
        } else {
          date = (values[2] && parseInt(values[2])) > maxDate ? maxDate : (values[2] && parseInt(values[2]))
        }
      }

      // 处理 时分 索引位3，4
      let hour = this.region ? [0, 0] : 0
      let minute = this.region ? [0, 0] : 0

      if (this.type === 'datetime') {
        if (this.region) {
          hour = [
            values[0][3] && parseInt(values[0][3]),
            values[1][3] && parseInt(values[1][3])
          ]
          minute = [
            values[0][4] && parseInt(values[0][4]),
            values[1][4] && parseInt(values[1][4])
          ]
        } else {
          hour = values[3] && parseInt(values[3])
          minute = values[4] && parseInt(values[4])
        }
      }
      const value = this.region ? [
        new Date(year[0], month[0] - 1, date[0], hour[0], minute[0]),
        new Date(year[1], month[1] - 1, date[1], hour[1], minute[1])
      ] : new Date(year, month - 1, date, hour, minute)

      this.innerValue = this.region ? this.formatRegion(value) : this.formatValue(value)
    },
    // picker列项更改矫正
    onColumnChange (pickerView, item, columnIndex, resolve) {
      this.updateInnerValue()
      resolve()
    },
    // 更新列数据
    updateColumnValues () {
      this.displayColumns = this.columns
      // 区分时间范围 还是 普通计时
      const values = this.region ? [
        this.getValueArray(this.innerValue[0]),
        this.getValueArray(this.innerValue[1])
      ] : this.getValueArray(this.innerValue)

      this.$nextTick(() => {
        // 根据数组 设置 pickerView 值
        const pickerView = this.$refs.pickerView || this.getPickerView()
        if (this.region) {
          const endPickerView = this.$refs.endPickerView || this.etPickerView(false)
          pickerView.setValues(values[0])
          endPickerView.setValues(values[1])
        } else {
          pickerView.setValues(values)
        }
      })
    },
    // 将日期拆分成数组
    getValueArray (value) {
      if (this.type === 'time') {
        const [hour, minute] = value.split(':')

        return [parseInt(hour), parseInt(minute)]
      }

      const values = [
        value.getFullYear(),
        value.getMonth() + 1,
        value.getDate(),
        value.getHours(),
        value.getMinutes()
      ]

      if (this.type === 'date') values.splice(3, 2)

      if (this.type === 'year-month') values.splice(2, 3)

      return values
    }
  }
}
