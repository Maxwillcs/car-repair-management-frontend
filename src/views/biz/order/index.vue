<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="客户手机号" prop="customerPhone" label-width="84px">
        <el-input
          v-model="queryParams.customerPhone"
          placeholder="请输入客户手机号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="金额" prop="amount">
        <el-input
          v-model="queryParams.amount"
          placeholder="请输入金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修需求" prop="repairDemand">
        <el-input
          v-model="queryParams.repairDemand"
          placeholder="请输入维修需求"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="维修id" prop="repairId">
        <el-input
          v-model="queryParams.repairId"
          placeholder="请输入维修id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单创建时间" prop="createTime" label-width="96px">
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
          v-hasPermi="['biz:order:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['biz:order:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['biz:order:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['biz:order:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单id" align="center" prop="orderId" />
      <el-table-column label="客户手机号" align="center" prop="customerPhone" />
      <el-table-column label="金额" align="center" prop="amount" />
      <el-table-column label="维修需求" align="center" prop="repairDemand" />
      <el-table-column label="维修id" align="center" prop="repairId" />
<!--      <el-table-column label="订单状态 (0代表维修中 1代表维修完成待支付 2代表支付完成)" align="center" prop="orderStatus" />-->
      <el-table-column align="center" prop="orderStatus">
        <template #header>
          <el-tooltip content="0代表维修中 1代表维修完成待支付 2代表支付完成" placement="top">
            <span>订单状态</span>
          </el-tooltip>
        </template>
        <template #default="{ row }">
<!--        <span>-->
<!--          {{ getOrderStatus(row.orderStatus) }}-->
<!--        </span>-->
        </template>
      </el-table-column>
      <el-table-column label="订单创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="210">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['biz:order:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['biz:order:remove']">删除</el-button>
          <el-button link type="primary" icon="Edit" @click="handlePay(scope.row)" v-hasPermi="['biz:order:pay']">支付</el-button>
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

    <!-- 添加订单管理对话框 -->
    <el-dialog :title="title" v-model="addOpen" width="500px" append-to-body>
      <el-form ref="addOrderRef" :model="addForm" :rules="rules" label-width="80px">
        <el-form-item label="客户手机号" prop="customerPhone" label-width="92px">
          <el-input v-model="addForm.customerPhone" placeholder="请输入客户手机号" />
        </el-form-item>
        <el-form-item label="金额" prop="amount" label-width="80px">
          <el-input v-model="addForm.amount" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="维修需求" prop="repairDemand" label-width="80px">
          <el-input v-model="addForm.repairDemand" placeholder="请输入维修需求" />
        </el-form-item>
        <el-divider content-position="center">生成维修记录</el-divider>
        <el-form-item label="维修员工姓名" prop="repairEmployeeName" label-width="110px">
          <el-input v-model="addForm.repairEmployeeName" placeholder="请输入维修员工姓名" />
        </el-form-item>
        <el-form-item label="维修判断" prop="repairDiagnosis" label-width="80px">
          <el-input v-model="addForm.repairDiagnosis" placeholder="请输入维修判断" />
        </el-form-item>
        <el-form-item label="维修进度" prop="repairProgress" label-width="80px">
          <el-input v-model="addForm.repairProgress" placeholder="请输入维修进度" />
        </el-form-item>
        <el-form-item label="预计维修完成时间" prop="estimatedRepairCompleteTime" label-width="130px">
          <el-date-picker clearable
                          v-model="addForm.estimatedRepairCompleteTime"
                          type="datetime"
                          value-format="YYYY-MM-DD HH:mm:ss"
                          placeholder="选择预计维修完成时间"
                          style="width: 280px;">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAddForm">确 定</el-button>
          <el-button @click="addCancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改订单管理对话框 -->
    <el-dialog :title="title" v-model="updateOpen" width="500px" append-to-body>
      <el-form ref="updateOrderRef" :model="updateForm" :rules="rules" label-width="80px">
        <el-form-item label="客户手机号" prop="customerPhone" label-width="92px">
          <el-input v-model="updateForm.customerPhone" placeholder="请输入客户手机号" />
        </el-form-item>
        <el-form-item label="金额" prop="amount" label-width="80px">
          <el-input v-model="updateForm.amount" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="维修需求" prop="repairDemand" label-width="80px">
          <el-input v-model="updateForm.repairDemand" placeholder="请输入维修需求" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitUpdateForm">确 定</el-button>
          <el-button @click="updateCancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 支付弹窗对话框 -->
    <el-dialog v-model="payDialogVisible" width="500px" title="支付订单">
      <div style="text-align: center;">
        <img :src="qrCodeUrl" alt="支付二维码" style="width: 200px; height: 200px; margin-bottom: 10px;" />
        <p>请扫描二维码完成支付</p>
      </div>
      <template #footer>
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPayment">完成支付</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, delOrder, addOrder, updateOrder, payOrder } from "@/api/biz/order";

const { proxy } = getCurrentInstance();

const orderList = ref([]);
const bizRepairsList = ref([]);
const addOpen = ref(false);
const updateOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedBizRepairs = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const payDialogVisible = ref(false);
const qrCodeUrl = ref("");
const currentOrderId = ref(0);

const dateRange = ref([]);

const handleDateChange = (val) => {
  queryParams.value.startCreateTime = val ? val[0] : '';
  queryParams.value.endCreateTime = val ? val[1] : '';
};

const data = reactive({
  updateForm: {},
  addForm: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerPhone: null,
    amount: null,
    repairDemand: null,
    repairId: null,
    orderStatus: null,
    startCreateTime: null,
    endCreateTime: null
  },
  rules: {
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    startCreateTime: [
      { required: true, message: "开始时间不能为空", trigger: "blur" }
    ],
    endCreateTime: [
      { required: true, message: "结束时间不能为空", trigger: "blur" }
    ],
    customerPhone: [
      { required: true, message: "客户手机号不能为空", trigger: "blur" }
    ],
    amount: [
      { required: true, message: "金额不能为空", trigger: "blur" }
    ],
    orderStatus: [
      { required: true, message: "订单状态 (0代表维修中 1代表维修完成待支付 2代表支付完成)不能为空", trigger: "change" }
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

const { queryParams, addForm, updateForm, rules } = toRefs(data);

/** 查询订单管理列表 */
function getList() {
  loading.value = true;
  listOrder(queryParams.value).then(response => {
    orderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 添加表单取消按钮
function addCancel() {
  addOpen.value = false;
  addReset();
}

function updateCancel() {
  updateOpen.value = false;
  updateReset();
}

// 更新表单重置
function updateReset() {
  updateForm.value = {
    orderId: null,
    createTime: null,
    customerPhone: null,
    amount: null,
    repairDemand: null,
    repairId: null,
    orderStatus: null
  };
  bizRepairsList.value = [];
  proxy.resetForm("updateOrderRef");
}

// 添加表单重置
function addReset() {
  addForm.value = {
    orderId: null,
    createTime: null,
    customerPhone: null,
    amount: null,
    repairDemand: null,
    repairId: null,
    orderStatus: null,
    repairEmployeeName: null,
    repairDiagnosis: null,
    repairProgress: null,
    startEstimatedRepairCompleteTime: null,
    endEstimatedRepairCompleteTime: null
  };
  bizRepairsList.value = [];
  proxy.resetForm("addOrderRef");
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
  ids.value = selection.map(item => item.orderId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  addReset();
  addOpen.value = true;
  title.value = "添加订单管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  updateReset();
  const _orderId = row.orderId || ids.value
  getOrder(_orderId).then(response => {
    updateForm.value = response.data;
    bizRepairsList.value = response.data.bizRepairsList;
    updateOpen.value = true;
    title.value = "修改订单管理";
  });
}

/** 提交按钮 */
function submitAddForm() {
  proxy.$refs["addOrderRef"].validate(valid => {
    if (valid) {
      addOrder(addForm.value).then(response => {
        proxy.$modal.msgSuccess("新增成功");
        addOpen.value = false;
        getList();
      });
    }
  });
}

function submitUpdateForm() {
  proxy.$refs["updateOrderRef"].validate(valid => {
    if (valid) {
      updateOrder(updateForm.value).then(response => {
        proxy.$modal.msgSuccess("修改成功");
        updateOpen.value = false;
        getList();
      });
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _orderIds = row.orderId || ids.value;
  proxy.$modal.confirm('是否确认删除订单管理编号为"' + _orderIds + '"的数据项？').then(function() {
    return delOrder(_orderIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

function handlePay(row) {
  currentOrderId.value = row.orderId;
  payDialogVisible.value = true;
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${row.orderId}`; // 这里生成二维码
}

function confirmPayment() {
    payOrder(currentOrderId.value).then(response => {
      proxy.$modal.msgSuccess("支付成功");
      payDialogVisible.value = false;
      getList()
    })
}

/** 维修管理序号 */
function rowBizRepairsIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 维修管理添加按钮操作 */
function handleAddBizRepairs() {
  let obj = {};
  obj.orderId = "";
  obj.repairEmployeeName = "";
  obj.repairDiagnosis = "";
  obj.repairProgress = "";
  obj.estimatedRepairCompleteTime = "";
  bizRepairsList.value.push(obj);
}

/** 维修管理删除按钮操作 */
function handleDeleteBizRepairs() {
  if (checkedBizRepairs.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的维修管理数据");
  } else {
    const bizRepairss = bizRepairsList.value;
    const checkedBizRepairss = checkedBizRepairs.value;
    bizRepairsList.value = bizRepairss.filter(function(item) {
      return checkedBizRepairss.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleBizRepairsSelectionChange(selection) {
  checkedBizRepairs.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('biz/order/export', {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

function getOrderStatus(status) {
  const statusMap = {
    0: "维修中",
    1: "维修完成待支付",
    2: "支付完成",
  };
  return statusMap[status] || "未知状态";
}

getList();
</script>
