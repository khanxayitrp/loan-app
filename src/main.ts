
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import Vue Query plugin
import { VueQueryPlugin } from '@tanstack/vue-query'


import './assets/main.css' // 👈 Add this line
import '@iconify/iconify'
// // Init FlyonUI JS (ถ้าต้องการใช้ JS component)


// Optional third-party libraries
// import $ from "jquery";
// import _ from "lodash";
// import noUiSlider from "nouislider";
// import "datatables.net";
// import "dropzone/dist/dropzone-min.js";

// window._ = _;
// window.$ = $;
// window.jQuery = $;
// window.DataTable = $.fn.dataTable;
// window.noUiSlider = noUiSlider;


// FlyonUI JS init (สำคัญถ้าใช้ component ที่มี JS)
import "flyonui/flyonui";  // Import หลัก


import 'flyonui/dist/accordion';  // Import specific component JS


import canDirective from './directives/can'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin) // 👈 ใช้แบบ default
app.directive('can', canDirective) // ลงทะเบียน directive

app.mount('#app')

