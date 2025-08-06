<template>
    <a-modal :visible="modelValue" :title="titleDescr" :width="'90%'" :style="{ top: '0%' }" @cancel="handleCancel"
        cancelText="关闭">
        <div style="border: 1px solid #4992BA; height: 300px;">
            <div
                style="width: 100%; font-size: 13px; color: #595959; align-items: center; margin-top: 10px; display: flex; margin-left:20px;">
                <div style="font-size: 13px; color:#595959; margin-top: 10px; width: 20%">
                    Service Id(必输，全局唯一):
                </div>
                <div
                    style="font-size: 13px; color:#595959; margin-top: 10px; display: flex; align-items: center; width: 70%">
                    <a-input v-model:value="serviceId" placeholder="必输: 手工添加唯一值" :class="custom - lable - textbox"
                        style="height: 24px; width: 100%; margin-left: 5px;" />
                </div>
            </div>
            <div
                style="width: 100%; font-size: 13px; color: #595959; align-items: center; margin-top: 10px; display: flex; margin-left:20px;">
                <div style="font-size: 13px; color:#595959; margin-top: 10px; width: 20%">
                    uri(必输):
                </div>
                <div
                    style="font-size: 13px; color:#595959; margin-top: 10px; display: flex; align-items: center; width: 70%">
                    <a-input v-model:value="inputUri" placeholder="必输，如: http://localhost:8080"
                        :class="custom - lable - textbox" style="height: 24px; width: 100%; margin-left: 5px;" />
                </div>
            </div>
            <div
                style="width: 100%; font-size: 13px; color: #595959; align-items: center; margin-top: 10px; display: flex; margin-left:20px;">
                <div style="font-size: 13px; color:#595959; margin-top: 10px; width: 20%">
                    路径(必输):
                </div>
                <div
                    style="font-size: 13px; color:#595959; margin-top: 10px; display: flex; align-items: center; width: 70%">
                    <a-input v-model:value="routePath" placeholder="必输，如: /api/path/action.do"
                        :class="custom - lable - textbox" style="height: 24px; width: 100%; margin-left: 5px;" />
                </div>
            </div>
        </div>
        <template #footer>
            <a-button @click="handleCancel">关闭</a-button>
            <a-button @click="handleSubmit">提交</a-button>
        </template>
    </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { message } from "ant-design-vue";
import PopRouter from '@/viewer/RouterMgt/PopRouter.vue';
import { Modal } from 'ant-design-vue';
import RouteApi from "@/api/RouteApi.js";

const emit = defineEmits(['update:visible', 'handleRefresh']);

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    routeId: {
        type: String,
        default: ''
    },
    editFlag: {
        type: Number,
        default: 1 //1-add 2-update
    }
});

const serviceId = ref('');
const routePath = ref('');
const inputUri = ref('');
const updateFlag = ref(1);
const titleDescr = ref('路由管理维护界面');

const handleCancel = () => {
    emit('update:modelValue', false);
    emit('handleRefresh');
};

const handleSubmit = () => {
    if (!serviceId.value || serviceId.value.trim() === '' || !routePath.value || routePath.value.trim() === '' || !inputUri.value || inputUri.value.trim() === '') {
        message.error('service id、uri以及路径值必输才能提交');
        return;
    }
    try {
        // 构建符合后端 GatewayRouteDefinition 的数据结构
        let payload = {
            "id": serviceId.value,
            "uri": `lb://${inputUri.value}`,
            "predicates": [
                {
                    "name": "Path",
                    "args": {
                        "pattern": routePath.value
                    }
                }
            ],
            "filters": [
                {
                    "name": "StripPrefix",
                    "args": {
                        "parts": "1"
                    }
                }
            ],
            "order": 0
        }
        RouteApi.createRoute(payload).then(async res => {
            message.success('路由创建成功');
        }).catch(err => {
            console.error("新增路由列表失败" + JSON.stringify(err));
            let errorMsg = err && err.message ? err.message : '未知错误';
            message.error(`路由创建失败: ${errorMsg}`);
        });
    } catch (err) {
        console.error(">>>>>>handleSubmit error", err);
    }
}

watch(
    [() => props.modelValue],
    ([newModelValue]) => {
        if (newModelValue) {  // 当模态框显示时
            serviceId.value = props.routeId;
            updateFlag.value = props.editFlag;
            if (updateFlag.value === 1) {
                titleDescr.value = '路由管理新增界面'
            } else if (updateFlag.value === 2) {
                titleDescr.value = '路由管理编辑界面'
            }
        } else {
            // 模态框关闭时清空数据
            serviceId.value = '';
            updateFlag.value = 1;
            titleDescr.value = '路由管理新增界面'
        }
        console.log(">>>>>>current serviceId->" + props.routeId + " and updateFlag->" + props.editFlag);
    },
    { immediate: true }  // 添加 immediate: true 确保组件挂载时就执行一次
);
</script>