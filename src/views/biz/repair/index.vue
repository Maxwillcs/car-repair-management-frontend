<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单id" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修员工姓名" prop="repairEmployeeName" label-width="100px">
        <el-input
          v-model="queryParams.repairEmployeeName"
          placeholder="请输入维修员工姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修判断" prop="repairDiagnosis">
        <el-input
          v-model="queryParams.repairDiagnosis"
          placeholder="请输入维修判断"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修进度" prop="repairProgress">
        <el-input
          v-model="queryParams.repairProgress"
          placeholder="请输入维修进度"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="预计维修完成时间" prop="estimatedRepairCompleteTime" label-width="140px">
        <el-date-picker
          clearable
          v-model="queryParams.estimatedRepairCompleteTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:00:00"
          placeholder="请选择预计维修完成时间(精确到小时)"
          style="width: 280px;">
        </el-date-picker>
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
          v-hasPermi="['biz:repair:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['biz:repair:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['biz:repair:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['biz:repair:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="repairList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="维修id" align="center" prop="repairId" />
      <el-table-column label="订单id" align="center" prop="orderId" />
      <el-table-column label="维修员工姓名" align="center" prop="repairEmployeeName" />
      <el-table-column label="维修判断" align="center" prop="repairDiagnosis" />
      <el-table-column label="维修进度" align="center" prop="repairProgress" />
      <el-table-column label="预计维修完成时间" align="center" prop="estimatedRepairCompleteTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.estimatedRepairCompleteTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['biz:repair:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['biz:repair:remove']">删除</el-button>
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

    <!-- 添加或修改维修管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="repairRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="订单id" prop="orderId" label-width="74px">
          <el-input v-model="form.orderId" placeholder="请输入订单id" />
        </el-form-item>
        <el-form-item label="维修员工姓名" prop="repairEmployeeName" label-width="118px">
          <el-input v-model="form.repairEmployeeName" placeholder="请输入维修员工姓名" />
        </el-form-item>
        <el-form-item label="维修判断" prop="repairDiagnosis" label-width="90px">
          <el-input v-model="form.repairDiagnosis" placeholder="请输入维修判断" />
        </el-form-item>
        <el-form-item label="维修进度" prop="repairProgress" label-width="90px">
          <el-input v-model="form.repairProgress" placeholder="请输入维修进度" />
        </el-form-item>
        <el-form-item label="预计维修完成时间" prop="estimatedRepairCompleteTime" label-width="147px">
          <el-date-picker clearable
            v-model="form.estimatedRepairCompleteTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:00:00"
            placeholder="请选择预计维修完成时间(精确到小时)"
            style="width: 280px;">
          </el-date-picker>
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

<script setup name="Repair">
import { listRepair, getRepair, delRepair, addRepair, updateRepair } from "@/api/biz/repair";

const { proxy } = getCurrentInstance();

const repairList = ref([]);
const bizOrdersList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedBizOrders = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderId: null,
    repairEmployeeName: null,
    repairDiagnosis: null,
    repairProgress: null,
    estimatedRepairCompleteTime: null
  },
  rules: {
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    orderId: [
      { required: true, message: "订单id不能为空", trigger: "blur" }
    ],
    repairEmployeeName: [
      { required: true, message: "维修员工姓名不能为空", trigger: "blur" }
    ],
    repairDiagnosis: [
      { required: true, message: "维修判断不能为空", trigger: "blur" }
    ],
    repairProgress: [
      { required: true, message: "维修进度不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询维修管理列表 */
function getList() {
  loading.value = true;
  listRepair(queryParams.value).then(response => {
    repairList.value = response.rows;
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
    repairId: null,
    createTime: null,
    orderId: null,
    repairEmployeeName: null,
    repairDiagnosis: null,
    repairProgress: null,
    estimatedRepairCompleteTime: null
  };
  bizOrdersList.value = [];
  proxy.resetForm("repairRef");
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
  ids.value = selection.map(item => item.repairId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加维修管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _repairId = row.repairId || ids.value
  getRepair(_repairId).then(response => {
    form.value = response.data;
    bizOrdersList.value = response.data.bizOrdersList;
    open.value = true;
    title.value = "修改维修管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["repairRef"].validate(valid => {
    if (valid) {
      form.value.bizOrdersList = bizOrdersList.value;
      if (form.value.repairId != null) {
        updateRepair(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRepair(form.value).then(response => {
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
  const _repairIds = row.repairId || ids.value;
  proxy.$modal.confirm('是否确认删除维修管理编号为"' + _repairIds + '"的数据项？').then(function() {
    return delRepair(_repairIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** ${subTable.functionName}序号 */
function rowBizOrdersIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** ${subTable.functionName}添加按钮操作 */
function handleAddBizOrders() {
  let obj = {};
  obj.customerPhone = "";
  obj.amount = "";
  obj.repairDemand = "";
  obj.repairId = "";
  obj.orderStatus = "";
  bizOrdersList.value.push(obj);
}

/** ${subTable.functionName}删除按钮操作 */
function handleDeleteBizOrders() {
  if (checkedBizOrders.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的${subTable.functionName}数据");
  } else {
    const bizOrderss = bizOrdersList.value;
    const checkedBizOrderss = checkedBizOrders.value;
    bizOrdersList.value = bizOrderss.filter(function(item) {
      return checkedBizOrderss.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleBizOrdersSelectionChange(selection) {
  checkedBizOrders.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('biz/repair/export', {
    ...queryParams.value
  }, `repair_${new Date().getTime()}.xlsx`)
}

getList();
</script>
