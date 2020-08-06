const currentYear = new Date().getFullYear()

export default {
  // region: Boolean,
  endMinHour: {
    type: Number,
    default: 0
  },
  endMaxHour: {
    type: Number,
    default: 23
  },
  endMinMinute: {
    type: Number,
    default: 0
  },
  endMaxMinute: {
    type: Number,
    default: 59
  },
  endMinDate: {
    type: Date,
    default: () => new Date(currentYear - 10, 0, 1)
  },
  endMaxDate: {
    type: Date,
    default: () => new Date(currentYear + 10, 11, 31)
  }
}
