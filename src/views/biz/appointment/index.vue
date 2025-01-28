<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="预约时间" prop="appointmentTime">
        <el-date-picker clearable
          v-model="queryParams.appointmentTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:00:00"
          placeholder="请选择预约时间(精确到小时)"
          style="width: 240px;">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="客户手机号" prop="customerPhone" label-width="82px">
        <el-input
          v-model="queryParams.customerPhone"
          placeholder="请输入客户手机号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="跟进员工姓名" prop="followUpEmployee" label-width="96px">
        <el-input
          v-model="queryParams.followUpEmployee"
          placeholder="请输入跟进员工姓名"
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
          v-hasPermi="['biz:appointment:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['biz:appointment:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['biz:appointment:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['biz:appointment:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="appointmentsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="预约id" align="center" prop="appointmentId" />
      <el-table-column label="预约时间" align="center" prop="appointmentTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.appointmentTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客户手机号" align="center" prop="customerPhone" />
      <el-table-column label="跟进员工姓名" align="center" prop="followUpEmployee" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['biz:appointment:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['biz:appointment:remove']">删除</el-button>
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
      <el-form ref="appointmentsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="预约时间" prop="appointmentTime">
          <el-date-picker clearable
            v-model="form.appointmentTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:00:00"
            placeholder="请选择预约时间(精确到小时)"
            style="width: 240px;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="客户手机号" prop="customerPhone" label-width="92px">
          <el-input v-model="form.customerPhone" placeholder="请输入客户手机号" />
        </el-form-item>
        <el-form-item label="跟进员工姓名" prop="followUpEmployee" label-width="106px">
          <el-input v-model="form.followUpEmployee" placeholder="请输入跟进员工姓名" />
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

<script setup name="Appointments">
import { listAppointments, getAppointments, delAppointments, addAppointments, updateAppointments } from "@/api/biz/appointment.js";

const { proxy } = getCurrentInstance();

const appointmentsList = ref([]);
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
    appointmentTime: null,
    customerPhone: null,
    followUpEmployee: null
  },
  rules: {
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    appointmentTime: [
      { required: true, message: "预约时间不能为空", trigger: "blur" }
    ],
    customerPhone: [
      { required: true, message: "客户手机号不能为空", trigger: "blur" }
    ],
    followUpEmployee: [
      { required: true, message: "跟进员工姓名不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户管理列表 */
function getList() {
  loading.value = true;
  listAppointments(queryParams.value).then(response => {
    appointmentsList.value = response.rows;
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
    appointmentId: null,
    createTime: null,
    appointmentTime: null,
    customerPhone: null,
    followUpEmployee: null
  };
  proxy.resetForm("appointmentsRef");
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
  ids.value = selection.map(item => item.appointmentId);
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
  const _appointmentId = row.appointmentId || ids.value
  getAppointments(_appointmentId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["appointmentsRef"].validate(valid => {
    if (valid) {
      if (form.value.appointmentId != null) {
        updateAppointments(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAppointments(form.value).then(response => {
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
  const _appointmentIds = row.appointmentId || ids.value;
  proxy.$modal.confirm('是否确认删除客户管理编号为"' + _appointmentIds + '"的数据项？').then(function() {
    return delAppointments(_appointmentIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('biz/appointment/export', {
    ...queryParams.value
  }, `appointments_${new Date().getTime()}.xlsx`)
}

getList();
</script>
