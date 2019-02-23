/* eslint-disable */
export function initialize(store, router){
	router.beforeEach((to, from, next) => {
	const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
	const currentUser = store.state.user;
	
	if(requiresAuth && !currentUser){
		next('/login');
	}else if(to.path == '/login' && currentUser){// if you're going to the login page but user is registered already
		next('/');
	}else{
		next();
	}
});

axios.interceptors.response.use(null, (error) =>{
	if(error.response.status == 401){
		localStorage.removeItem("last_url");
		localStorage.setItem("last_url", window.location.pathname);
		store.commit('logout');
		router.push('/login');

	}

	return Promise.reject(error);
});

if(store.getters.currentUser != null){
	axios.defaults.headers.common["Authorization"] = `Bearer ${store.getters.currentUser.token}`;
}



}