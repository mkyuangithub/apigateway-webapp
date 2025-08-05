<template>
    <a-modal :visible="modelValue" :title="titleDescr" :width="'90%'" :style="{ top: '0%' }" @cancel="handleCancel"
        cancelText="关闭">
        <template #footer>
            <a-button @click="handleCancel">关闭</a-button>
        </template>
    </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { message } from "ant-design-vue";
import UserChatConfigApi from "@/api/UserChatConfigApi.js";
import { Modal } from 'ant-design-vue';
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
const updateFlag = ref(1);
const titleDescr = ref('路由管理维护界面');

const handleCancel = () => {
    emit('update:modelValue', false);
    emit('handleRefresh');
};

watch(
    [() => props.modelValue],
    ([newModelValue]) => {
        if (newModelValue) {  // 当模态框显示时
            serviceId.value = props.routeId;
            updateFlag.value = props.editFlag;
            titleDescr.value = '路由管理编辑界面'
        } else {
            // 模态框关闭时清空数据
            serviceId.value = '';
            updateFlag.value = 1;
            titleDescr.value = '路由管理新增界面'
        }
    },
    { immediate: true }  // 添加 immediate: true 确保组件挂载时就执行一次
);
</script>