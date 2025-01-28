<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户姓名" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户手机号" prop="customerPhone" label-width="82px">
        <el-input
          v-model="queryParams.customerPhone"
          placeholder="请输入客户手机号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户总消费" prop="totalSpending" label-width="82px">
        <el-input
          v-model="queryParams.totalSpending"
          placeholder="请输入客户总消费"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户等级" prop="customerLevel">
        <el-tooltip
            class="item"
            effect="dark"
            content="0代表普通客户 1代表老客户 2代表VIP"
            placement="top"
        >
          <el-input
              v-model="queryParams.customerLevel"
              placeholder="请输入客户等级"
              clearable
              @keyup.enter="handleQuery"
          />
        </el-tooltip>
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
          v-hasPermi="['biz:customers:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['biz:customers:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['biz:customers:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['biz:customers:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customersList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="客户id" align="center" prop="customerId" />
      <el-table-column label="客户姓名" align="center" prop="customerName" />
      <el-table-column label="客户手机号" align="center" prop="customerPhone" />
      <el-table-column label="客户总消费" align="center" prop="totalSpending" />
      <el-table-column label="客户等级" align="center" prop="customerLevel" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['biz:customers:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['biz:customers:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改客户管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customersRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="客户手机号" prop="customerPhone" label-width="92px">
          <el-input v-model="form.customerPhone" placeholder="请输入客户手机号" />
        </el-form-item>
        <el-form-item label="客户总消费" prop="totalSpending" label-width="92px">
          <el-input v-model="form.totalSpending" placeholder="请输入客户总消费" />
        </el-form-item>
        <el-form-item label="客户等级" prop="customerLevel">
          <el-tooltip
              class="item"
              effect="dark"
              content="0代表普通客户 1代表老客户 2代表VIP"
              placement="top"
          >
            <el-input
                v-model="form.customerLevel"
                placeholder="请输入客户等级"
            />
          </el-tooltip>
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

<script setup name="Customers">
import { listCustomers, getCustomers, delCustomers, addCustomers, updateCustomers } from "@/api/biz/customers";

const { proxy } = getCurrentInstance();

const customersList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerName: null,
    customerPhone: null,
    totalSpending: null,
    customerLevel: null
  },
  rules: {
    customerName: [
      { required: true, message: "客户姓名不能为空", trigger: "blur" }
    ],
    customerPhone: [
      { required: true, message: "客户手机号不能为空", trigger: "blur" }
    ],
    totalSpending: [
      { required: true, message: "客户总消费不能为空", trigger: "blur" }
    ],
    customerLevel: [
      { required: true, message: "客户等级 (0代表普通客户 1代表老客户 2代表VIP)不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户管理列表 */
function getList() {
  loading.value = true;
  listCustomers(queryParams.value).then(response => {
    customersList.value = response.rows;
    total.value = response.total;
    loading.value = false;
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
    customerId: null,
    customerName: null,
    customerPhone: null,
    totalSpending: null,
    customerLevel: null
  };
  proxy.resetForm("customersRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.customerId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加客户管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _customerId = row.customerId || ids.value
  getCustomers(_customerId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customersRef"].validate(valid => {
    if (valid) {
      if (form.value.customerId != null) {
        updateCustomers(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCustomers(form.value).then(response => {
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
  const _customerIds = row.customerId || ids.value;
  proxy.$modal.confirm('是否确认删除客户管理编号为"' + _customerIds + '"的数据项？').then(function() {
    return delCustomers(_customerIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('biz/customers/export', {
    ...queryParams.value
  }, `customers_${new Date().getTime()}.xlsx`)
}

getList();
</script>
