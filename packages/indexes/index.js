import Indexes from './src/main'

Indexes.install = Vue => {
  Vue.component(Indexes.name, Indexes)
}

export default Indexes
