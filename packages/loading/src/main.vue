<template>
  <div class="wd-loading" :style="{ 'width': size, 'height': size, 'color': color }">
    <div v-if="type === 'circle-outline'" class="wd-loading--circle-outline" :style="{ 'width': size, 'height': size }"/>
    <span v-if="type === 'circle'" class="wd-loading__spinner wd-loading--circle">
      <svg viewBox="25 25 50 50">
        <circle cx="50" cy="50" r="20" fill="none" />
      </svg>
    </span>
    <span v-else-if="type === 'spinner'" class="wd-loading__spinner wd-loading--spinner">
      <i class="wd-loading__spinner-dot" v-for="item in 12" :key="item"></i>
    </span>
  </div>
</template>

<script>
export default {
  name: 'WdLoading',
  props: {
    type: {
      type: String,
      default: 'circle-outline'
    },
    color: {
      type: String,
      default: '#c5c5c5'
    },
    size: {
      type: String,
      default: '32px'
    }
  }
}
</script>
