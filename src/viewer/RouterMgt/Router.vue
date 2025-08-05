<template>
    <div>
        <!-- 页面起始的添加与刷新按钮所在区域-->
        <div style="width:100%; display: flex; justify-content: space-between;">
            <div style="cursor: pointer; display: flex; margin-top: 0px;  margin-bottom: 20px; align-items: center; "
                @click="popAddRoutes()">
                <div
                    style="width: 25px; height: 25px; border: 1px dashed blue; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <PlusOutlined style="color: blue; font-size: 13px;" />
                </div>
                <span style="color: #595959;  margin-left: 10px;  font-size:13px;">添加一条路由</span>
            </div>
            <!--刷新按钮-->
            <div>
                <a-button type="text" size="small" @click="handleRefresh()">
                    <SyncOutlined />刷新
                </a-button>
            </div>
        </div>
        <!-- 搜索区域-->
        <span style="font-weight: bold; font-size: 16px; color: #595959;">
            <div style="display: flex; justify-content: space-between;">
                <span style="font-weight: bold; font-size: 16px; color: #595959;">
                    当前系统己有路由列表
                </span>
            </div>
        </span>
        <div style="display: flex; margin-top: 10px; align-items: center;">
            <div style="width:5%">
                <span style="font-size: 14px; color: dodgerblue;">搜索:</span>
            </div>
            <div style="width: 90%;">
                <a-input v-model:value="searchedUri" autocomplete="off" placeholder="按照uri搜" allowClear
                    style="width: 100%; color:#595959; margin-left: 10px;" />
            </div>
            <div style="width: 5%; margin-left: 10px;">
                <img src="/assets/images/search-blue.png"
                    style="width: 24px; height: 24px; margin-left: 10px; cursor: pointer;" @click="handleSearchUri()">
            </div>
        </div>
        <!-- 以分页表格列出数据区域-->
        <div style="margin-top: 10px;">
            <a-table :columns="columns" :data-source="routeList" :pagination="pagination" :row-selection="{
                selectedRowKeys: selectedRowKeys,
                onChange: onSelectChange,
                type: 'checkbox'  // 明确指定checkbox类型
            }" :row-class-name="getRowClassName" style="border: 1px solid #4992BA;" @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'uri'">
                        <a @click="handleEdit(record)" style="text-decoration: underline;">{{ record.uri }}</a>
                    </template>
                </template>
            </a-table>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { message } from "ant-design-vue";
import { encrypt, decrypt, encrypt_url } from "@/toolkit/secure.js";
import authorization from "@/toolkit/authorization.js";
import RouteApi from "@/api/RouteApi.js";
import { Modal } from 'ant-design-vue';
const routeList = ref([]);
const selectedRowKeys = ref([]);
const itemId = ref('');
const searchedUri = ref('');
const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: false
});

const columns = [
    {
        title: 'id',
        dataIndex: 'id',
        key: 'id',
        width: 100,
    },
    {
        title: 'uri',
        dataIndex: 'uri',
        key: 'uri',
        width: 150,
    },
    {
        title: '路径',
        dataIndex: 'type',
        key: 'type',
        width: 350,
        align: 'center',  // 添加居中对齐
    }
];
// 修改行类名判断逻辑
const getRowClassName = (routes, index) => {
    const baseClass = index % 2 === 0 ? 'even-row' : 'odd-row';
    return selectedRowKeys.value.includes(routes.id) ? `${baseClass} selected-row` : baseClass;
};

// 选择回调函数，添加key字段判断
const onSelectChange = (selectedKeys, selectedRows) => {
    selectedRowKeys.value = selectedKeys;
};

const handleTableChange = (pag) => {
    pagination.value.current = pag.current;
    handleSearchUri(searchedUri, pag.current);
};

const handleEdit = async () => {
    try {

    } catch (err) {
        console.error(">>>>>>handleEdit error", err);
    }
}

const popAddRoutes = async () => {
    try {

    } catch (err) {
        console.error(">>>>>>popAddRoutes error", err);
    }
}

const handleRefresh = async () => {
    try {
        handleSearchUri(searchedUri.value, pagination.value.current)
    } catch (err) {
        console.error(">>>>>>handleRefresh error", err);
    }
}
const handleSearchUri = async (sarchedUri, pag) => {
    try {
        let payload = {
            "searchedUri": searchedUri.value,
            "pageNumber": pagination.value.current,
            "pageSize": pagination.value.pageSize,
        }
        RouteApi.searchRoutes(payload).then(async res => {
            routeList.value = res.content.map(item => ({
                ...item,
                key: item.id // 确保每条数据都有唯一的key
            }));
            pagination.value.total = res.totalElements;
        }).catch(err => {
            console.error("获取系统当前路由列表失败" , err);
        });
    } catch (err) {
        console.error(">>>>>>handleSearchUri error", err);
    }
}
onMounted(() => {
    handleSearchUri('', 1);
});
</script>