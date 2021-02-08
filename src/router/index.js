import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/views/Login.vue";
import Home from "@/views/Home.vue";
import Register from "@/views/Register.vue";
import store from "../store";
import ClassAdd from "@/views/ClassAdd.vue"

Vue.use(VueRouter);

const routes = [
  {
    path: "/register",
    name: "Register",
    component: Register,
    beforeEnter: (to, from, next) => {
      if(!store.getters.isLoggedIn) next();
      else next({ name: "Home" })
    }
  },
  {
    path: "/",
    name: "Login",
    component: Login,
    beforeEnter: (to, from, next) => {
      if (store.getters.isLoggedIn) next({ name: "Home" });
      else next();
    }
  },
  {
    path: "/home",
    name: "Home",
    component: Home
  },
  {
    path: "/classadd",
    name: "Class Add",
    component: ClassAdd
  },
  {
    path: "*",
    name: "Else",
    beforeEnter: (to, from, next) => {
      next({ name: "Home" });
    }
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

// Require user to be logged in
router.beforeEach((to, from, next) => {
  if (to.name !== "Login" && to.name !== "Register" && !store.getters.isLoggedIn 
  || Date.now() <= store.state.user.exp) {
    store.dispatch('logout');
    next({ name: "Login" });
  } else next();
});

export default router;
