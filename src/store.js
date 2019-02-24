/* eslint-disable */

import objCodec from 'object-encode';
var ryteops = ')*myNewAWESOME-mmryteops254@%^&%';
import {getLocalUser} from "./helpers/auth";

let user = null;
if(getLocalUser() == null){
	user = null;
	// console.log(1)
}else{
	user = objCodec.decode_object(getLocalUser(), 'base64', ryteops );
}

export default {
  state:{
	  user,
	  balance: 0,
	  events: [],
	  message: ''
  },

	mutations:{
		logout(state){
			localStorage.removeItem("user")
			state.user = null
			window.location = ''
		},

		loginSuccess(state, payload){
			state.user = Object.assign({}, payload.user);
			let token = {token: payload.token}
			localStorage.setItem("user", JSON.stringify(objCodec.encode_object( state.user, 'base64', ryteops )));
			localStorage.setItem("jwt", JSON.stringify(objCodec.encode_object( token, 'base64', ryteops )));
		},

		updateBalance(state, payload){
			state.balance = payload
		},

		updateMessage(state, payload){
			state.message = payload
		}
	},

	getters:{
		email(state){
			return state.email;
		}
	}
}
