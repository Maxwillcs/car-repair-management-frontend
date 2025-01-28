import request from '@/utils/request'

// 查询客户管理列表
export function listAppointments(query) {
  return request({
    url: '/biz/appointment/list',
    method: 'get',
    params: query
  })
}

// 查询客户管理详细
export function getAppointments(appointmentId) {
  return request({
    url: '/biz/appointment/' + appointmentId,
    method: 'get'
  })
}

// 新增客户管理
export function addAppointments(data) {
  return request({
    url: '/biz/appointment',
    method: 'post',
    data: data
  })
}

// 修改客户管理
export function updateAppointments(data) {
  return request({
    url: '/biz/appointment',
    method: 'put',
    data: data
  })
}

// 删除客户管理
export function delAppointments(appointmentId) {
  return request({
    url: '/biz/appointment/' + appointmentId,
    method: 'delete'
  })
}
