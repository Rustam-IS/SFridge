import { createApp } from 'vue'

import { Quasar } from 'quasar'
import ru from 'quasar/lang/ru'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'


import App from './App.vue'

createApp(App)
    .use(Quasar, {
        lang: ru,
        plugins: {},
    })
    .mount("#app");
