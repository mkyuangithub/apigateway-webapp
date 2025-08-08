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
                        style="height: 24px; width: 100%; margin-left: 5px;" :disabled="updateFlag === 2" />
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
            <div
                style="width: 100%; font-size: 13px; color: #595959; align-items: center; margin-top: 10px; display: flex; margin-left:20px;">
                <div style="font-size: 13px; color:#595959; margin-top: 10px; width: 20%">
                    前缀过滤器(可选):
                </div>
                <div
                    style="font-size: 13px; color:#595959; margin-top: 10px; display: flex; align-items: center; width: 70%">
                    <a-checkbox v-model:checked="stripPrefixEnabled" style="margin-right: 10px;"></a-checkbox>
                    <a-input v-model:value="stripPrefixArgValue" placeholder="可输入值：1，2，3"
                        :disabled="!stripPrefixEnabled" :class="custom - lable - textbox"
                        style="height: 24px; width: 100%; margin-left: 5px;" />
                </div>
            </div>
            <div
                style="width: 100%; font-size: 13px; color: #595959; align-items: center; margin-top: 10px; display: flex; margin-left:20px;">
                <div style="font-size: 13px; color:#595959; margin-top: 10px; width: 20%">
                    connect timeout时间(毫秒):
                </div>
                <div
                    style="font-size: 13px; color:#595959; margin-top: 10px; display: flex; align-items: center; width: 70%">
                    <a-input v-model:value="connectTimeout" placeholder="5000" :class="custom - lable - textbox"
                        style="height: 24px; width: 100%; margin-left: 5px;" />
                </div>
            </div>
            <div
                style="width: 100%; font-size: 13px; color: #595959; align-items: center; margin-top: 10px; display: flex; margin-left:20px;">
                <div style="font-size: 13px; color:#595959; margin-top: 10px; width: 20%">
                    response timeout时间(毫秒):
                </div>
                <div
                    style="font-size: 13px; color:#595959; margin-top: 10px; display: flex; align-items: center; width: 70%">
                    <a-input v-model:value="responseTimeout" placeholder="15000" :class="custom - lable - textbox"
                        style="height: 24px; width: 100%; margin-left: 5px;" />
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
const stripPrefixEnabled = ref(false);
const stripPrefixArgValue = ref(1);
const responseTimeout = ref(15000);
const connectTimeout = ref(5000);
const handleCancel = () => {
    emit('update:modelValue', false);
    emit('refresh-routers');
};

const handleLoadRoute = () => {
    try {
        let payload = {
            routeId: serviceId.value
        }
        RouteApi.getRouteById(payload).then(async res => {
            console.log(">>>>>>得到后台数据->" + JSON.stringify(res));
            if (res) {
                const routeData = res;
                inputUri.value = routeData.uri || '';

                // 获取路径谓词
                if (routeData.predicates && routeData.predicates.length > 0) {
                    const pathPredicate = routeData.predicates.find(p => p.name === 'Path');
                    if (pathPredicate && pathPredicate.args && pathPredicate.args.pattern) {
                        routePath.value = pathPredicate.args.pattern;
                    }
                }
                // 设置超时值，如果存在
                if (routeData.metadata) {
                    responseTimeout.value = routeData.metadata['response-timeout'] || 15000;
                    connectTimeout.value = routeData.metadata['connect-timeout'] || 5000;
                }
                // 检查是否有 StripPrefix 过滤器
                if (routeData.filters && routeData.filters.length > 0) {
                    const stripPrefixFilter = routeData.filters.find(f => f.name === 'StripPrefix');
                    if (stripPrefixFilter) {
                        stripPrefixEnabled.value = true;
                        if (stripPrefixFilter.args && stripPrefixFilter.args.parts) {
                            stripPrefixArgValue.value = stripPrefixFilter.args.parts;
                        }
                    } else {
                        stripPrefixEnabled.value = false;
                    }
                } else {
                    stripPrefixEnabled.value = false;
                }
            }
        }).catch(err => {
            console.error("加载路由byId失败" + JSON.stringify(err));
            let errorMsg = err && err.message ? err.message : '未知错误';
            message.error(`加载路由byId失败: ${errorMsg}`);
        });
    } catch (err) {
        console.error(">>>>>>handleLoadRoute出错",err);
    }
}

const handleSubmit = () => {
    if (!serviceId.value || serviceId.value.trim() === '' || !routePath.value || routePath.value.trim() === '' || !inputUri.value || inputUri.value.trim() === '') {
        message.error('service id、uri以及路径值必输才能提交');
        return;
    }
    try {
        // 构建符合后端 GatewayRouteDefinition 的数据结构
        let payload = {
            "id": serviceId.value,
            "uri": inputUri.value,
            "predicates": [
                {
                    "name": "Path",
                    "args": {
                        "pattern": routePath.value
                    }
                }
            ],
            "filters": [
                //{
                //    "name": "StripPrefix",
                //    "args": {
                //        "parts": "1"
                //    }
                // }
            ],
            "order": 0,
            "metadata": {
                "response-timeout": responseTimeout.value ? parseInt(responseTimeout.value) : 15000,  // 默认15秒
                "connect-timeout": connectTimeout.value ? parseInt(connectTimeout.value) : 5000      // 默认5秒
            }
        }
        // 如果启用了前缀过滤器，则添加到filters中
        if (stripPrefixEnabled.value) {
            payload.filters.push({
                "name": "StripPrefix",
                "args": {
                    "parts": stripPrefixArgValue.value.toString()
                }
            });
        }
        console.log(">>>>>>点击提交动作，当前updateFlag->" + updateFlag);
        if (updateFlag.value === 1) {
            RouteApi.createRoute(payload).then(async res => {
                message.success('路由创建成功');
            }).catch(err => {
                console.error("新增路由列表失败" + JSON.stringify(err));
                let errorMsg = err && err.message ? err.message : '未知错误';
                message.error(`路由创建失败: ${errorMsg}`);
            });
        } else if (updateFlag.value === 2) {
            RouteApi.updateRoute(payload).then(async res => {
                message.success('路由更新成功');
            }).catch(err => {
                console.error("更新路由列表失败" + JSON.stringify(err));
                let errorMsg = err && err.message ? err.message : '未知错误';
                message.error(`更新路由失败: ${errorMsg}`);
            });
        }
    } catch (err) {
        console.error(">>>>>>handleSubmit error", err);
    } finally {
        emit('refresh-routers');
    }
}

watch(
    [() => props.modelValue],
    ([newModelValue]) => {
        if (newModelValue) {  // 当模态框显示时
            serviceId.value = props.routeId;
            updateFlag.value = props.editFlag;
            console.log(">>>>>>当前正在编辑的serviceId为->" + serviceId.value);
            if (updateFlag.value === 1) {
                titleDescr.value = '路由管理新增界面'
            } else if (updateFlag.value === 2) {
                titleDescr.value = '路由管理编辑界面';
                handleLoadRoute();
            }
        }
        console.log(">>>>>>current serviceId->" + props.routeId + " and updateFlag->" + props.editFlag);
    },
    { immediate: true }  // 添加 immediate: true 确保组件挂载时就执行一次
);
</script>
