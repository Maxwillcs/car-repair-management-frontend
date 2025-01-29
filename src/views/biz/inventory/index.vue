<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="零件名" prop="partName">
        <el-input
            v-model="queryParams.partName"
            placeholder="请输入零件名"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="变更时间" prop="changeTime">
        <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            @change="handleDateChange">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="零件数量" prop="partQuantity">
        <el-input
            v-model="queryParams.partQuantity"
            placeholder="请输入零件数量"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="零件父id" prop="parentId">
        <el-input
            v-model="queryParams.parentId"
            placeholder="请输入零件父id"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="零件祖级列表" prop="ancestors" label-width="100px">
        <el-input
            v-model="queryParams.ancestors"
            placeholder="请输入零件祖级列表"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['biz:inventory:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="Sort"
            @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
        v-if="refreshTable"
        v-loading="loading"
        :data="inventoryList"
        row-key="partId"
        :default-expand-all="isExpandAll"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="零件名" prop="partName" />
      <el-table-column label="变更时间" align="center" prop="changeTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.changeTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="零件数量" align="center" prop="partQuantity" />
      <el-table-column label="零件父id" align="center" prop="parentId" />
      <el-table-column label="零件祖级列表" align="center" prop="ancestors" />
      <el-table-column label="状态(0正常 1停用)" align="center" prop="status" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['biz:inventory:edit']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['biz:inventory:add']">新增</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['biz:inventory:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改库存管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="inventoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="零件名" prop="partName">
          <el-input v-model="form.partName" placeholder="请输入零件名" />
        </el-form-item>
        <el-form-item label="变更时间" prop="changeTime">
          <el-date-picker clearable
                          v-model="form.changeTime"
                          type="datetime"
                          value-format="YYYY-MM-DD HH:00:00"
                          placeholder="选择变更时间(精确到小时)">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="零件数量" prop="partQuantity">
          <el-input v-model="form.partQuantity" placeholder="请输入零件数量" />
        </el-form-item>
        <el-form-item label="零件父id" prop="parentId">
          <el-tree-select
              v-model="form.parentId"
              :data="inventoryOptions"
              :props="{ value: 'partId', label: 'partName', children: 'children' }"
              value-key="partId"
              placeholder="请选择零件父id"
              check-strictly
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Inventory">
import { listInventory, getInventory, delInventory, addInventory, updateInventory } from "@/api/biz/inventory";

const { proxy } = getCurrentInstance();

const inventoryList = ref([]);
const inventoryOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);

const dateRange = ref([]);

const handleDateChange = (val) => {
  queryParams.value.startTime = val ? val[0] : '';
  queryParams.value.endTime = val ? val[1] : '';
};

const data = reactive({
  form: {},
  queryParams: {
    partName: null,
    startTime: null,
    endTime: null,
    partQuantity: null,
    parentId: null,
    ancestors: null
  },
  rules: {
    partName: [
      { required: true, message: "零件名不能为空", trigger: "blur" }
    ],
    changeTime: [
      { required: true, message: "变更时间不能为空", trigger: "blur" }
    ],
    startTime: [
      { required: true, message: "开始时间不能为空", trigger: "blur" }
    ],
    endTime: [
      { required: true, message: "结束时间不能为空", trigger: "blur" }
    ],
    partQuantity: [
      { required: true, message: "零件数量不能为空", trigger: "blur" }
    ],
    parentId: [
      { required: true, message: "零件父id不能为空", trigger: "blur" }
    ],
    ancestors: [
      { required: true, message: "零件祖级列表不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询库存管理列表 */
function getList() {
  loading.value = true;
  listInventory(queryParams.value).then(response => {
    inventoryList.value = proxy.handleTree(response.data, "partId", "parentId");
    loading.value = false;
  });
}

/** 查询库存管理下拉树结构 */
function getTreeselect() {
  listInventory().then(response => {
    inventoryOptions.value = [];
    const data = { partId: 0, partName: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.data, "partId", "parentId");
    inventoryOptions.value.push(data);
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    partId: null,
    partName: null,
    startTime: null,
    endTime: null,
    partQuantity: null,
    parentId: null,
    ancestors: null,
    status: null
  };
  proxy.resetForm("inventoryRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeselect();
  if (row != null && row.partId) {
    form.value.parentId = row.partId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "添加库存管理";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  getInventory(row.partId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改库存管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["inventoryRef"].validate(valid => {
    if (valid) {
      if (form.value.partId != null) {
        updateInventory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addInventory(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除库存管理编号为"' + row.partId + '"的数据项？').then(function() {
    return delInventory(row.partId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>
