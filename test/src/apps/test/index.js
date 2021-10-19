import Vue from 'vue';
import App from './App.vue';

// Add container to document to test the app
const el = document.createElement("div");
el.id = "build-system-app-test";
document.body.appendChild(el);

new Vue({ el, render: h => h(App) });