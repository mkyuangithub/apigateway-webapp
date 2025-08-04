<template>
	<div class="master">
		<router-view />
	</div>
</template>
<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Authorization from "@/toolkit/authorization.js";
import UserLoginApi from "@/api/UserLoginApi.js";
import { encrypt, decrypt, encrypt_url } from "@/toolkit/secure.js";
import authorization from "../toolkit/authorization";
import { message } from "ant-design-vue";
const route = useRoute();
const router = useRouter();

const intoMaster = () => {
  router.replace({
    name: "Center",
    query: route.query || {},
    params: {
      channel: route.params?.channel || "default"
    }
  });
}
const checkLoginInfo = async () => {
    try {
        const userSession = Authorization.get();
        console.log("userSession->", userSession);

        if (!userSession || userSession === null) {
            let channel = route.params.channel || 'default';
            await router.replace({
                name: 'Login',
                params: {
                    channel
                }
            });
            return false;
        }
		let token=Authorization.getToken();
		let loginId=Authorization.getLoginId();
        let payload = {
			loginId: loginId,
			token: token
        }
        
        // 使用 await 等待 Promise 结果
        const res = await UserLoginApi.checkUserLogin(payload);
        console.log(">>>>>>after checkLoginToken the result is->", JSON.stringify(res));
        const finalResult = res;
        console.log("最终返回值：", finalResult);
        return finalResult;
    } catch (err) {
        console.log(">>>>>>checkUserLogin error->", err);
        return -1;
    }
}


onMounted(async () => {
	try {
		const isLoggedIn = await checkLoginInfo();
		console.log(">>>>>>isLoggedIn->"+isLoggedIn);
		if (isLoggedIn===1) {
			intoMaster();
		}else if(isLoggedIn==0){
			let channel = route.params.channel || 'default';
			await router.replace({
				name: 'Login',
				params: {
					channel
				}
			});
			return false;
		}else{
			console.error(">>>>>>inital to Master error->", err);
		}
	} catch (err) {
		console.error(">>>>>>inital to Master error->", err);
	}
});
</script>
<style scoped>
.master {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #f7f7f7;
}
</style>