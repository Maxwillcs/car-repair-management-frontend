<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="24">
        <blockquote class="text-warning" style="font-size: 14px">
          55210327 黄超 maxwill
        </blockquote>

        <hr />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>基于WEB的XX汽车维修公司维修管理系统设计与实现</h2>
        <p>
          课题背景：近些年来，汽车的数量越来越多,XX汽车维修公司所维修的车辆，不仅是数量的增加，不同品牌、不同型号、油车、电车、油混车种类也越来越多，为提高服务质量和维修效率，需开发管理平台，实现全过程的规范管理。
          具体内容：完成车辆从进入公司接管车辆开始，到维修结束将车辆交给客户的全过程管理。
          基本要求：调研现有的同类管理平台，根据XX公司的实际情况，完成以上功能，满足公司维修业务的基本要求。
        </p>
        <p>
          <b>当前版本:</b> <span>v{{ version }}</span>
        </p>
        <p>
          <el-tag type="danger">&yen;免费开源</el-tag>
        </p>
        <p>
          <el-button
            type="primary"
            icon="Cloudy"
            plain
            @click="goTarget('https://gitee.com/y_project/RuoYi-Vue')"
            >访问码云</el-button
          >
          <el-button
            icon="HomeFilled"
            plain
            @click="goTarget('http://ruoyi.vip')"
            >访问主页</el-button
          >
        </p>
      </el-col>

      <el-col :sm="24" :lg="12" style="padding-left: 50px">
        <el-row>
          <el-col :span="12">
            <h2>技术选型</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <h4>后端技术</h4>
            <ul>
              <li>SpringBoot</li>
              <li>Spring Security</li>
              <li>JWT</li>
              <li>MyBatis</li>
              <li>Druid</li>
              <li>Fastjson</li>
              <li>...</li>
            </ul>
          </el-col>
          <el-col :span="6">
            <h4>前端技术</h4>
            <ul>
              <li>Vue</li>
              <li>Vuex</li>
              <li>Element-ui</li>
              <li>Axios</li>
              <li>Sass</li>
              <li>Quill</li>
              <li>...</li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>本月订单数据</span>
            </div>
          </template>
          <div class="body">
            本月订单总数: {{ orderCount }}
            <br />
            本月总金额流水: {{ totalCount }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>未来7天内预约记录</span>
            </div>
          </template>
          <div class="body">
            <el-table :data="appointments" style="width: 100%">
              <el-table-column label="预约时间" prop="appointmentTime" width="160"></el-table-column>
              <el-table-column label="客户手机号" prop="customerPhone" width="140"></el-table-column>
              <el-table-column label="跟进员工" prop="followUpEmployee" width="120"></el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>未来7天内提车时间</span>
            </div>
          </template>
          <div class="body">
            <div class="body">
              <el-table :data="pickUps" style="width: 100%">
                <el-table-column label="提车时间" prop="estimatedRepairCompleteTime" width="160"></el-table-column>
                <el-table-column label="客户手机号" prop="customerPhone" width="140"></el-table-column>
                <el-table-column label="维修员工" prop="repairEmployeeName" width="120"></el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">

import request from "@/utils/request.js";

const version = ref('1.0.0')

function goTarget(url) {
  window.open(url, '__blank')
}

// 本月订单数据查询
const orderCount = ref(0)
const totalCount = ref(0)

function getOrderData() {
  request({
    url: 'order/getOrderData',
    method: 'get'
  }).then((res) => {
    orderCount.value = res.orderCount
    totalCount.value = res.totalCount
  })
}

getOrderData()

// 未来7天内预约记录查询

const appointments = ref([])

function getAppointmentData() {
  request({
    url: 'appointment/getAppointmentData',
    method: 'get',
  }).then((res) => {
    appointments.value = res.data
  })
}

getAppointmentData()

// 未来7天内提车时间查询
const pickUps = ref([])

function getPickUpsData() {
  request({
    url: 'repair/getPickUpData',
    method: 'get',
  }).then((res) => {
    console.log(res)
    pickUps.value = res.data
  })
}

getPickUpsData()

</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

