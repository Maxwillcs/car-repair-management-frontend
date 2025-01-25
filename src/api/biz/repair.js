import request from '@/utils/request'

// 查询维修管理列表
export function listRepair(query) {
  return request({
    url: '/biz/repair/list',
    method: 'get',
    params: query
  })
}

// 查询维修管理详细
export function getRepair(repairId) {
  return request({
    url: '/biz/repair/' + repairId,
    method: 'get'
  })
}

// 新增维修管理
export function addRepair(data) {
  return request({
    url: '/biz/repair',
    method: 'post',
    data: data
  })
}

// 修改维修管理
export function updateRepair(data) {
  return request({
    url: '/biz/repair',
    method: 'put',
    data: data
  })
}

// 删除维修管理
export function delRepair(repairId) {
  return request({
    url: '/biz/repair/' + repairId,
    method: 'delete'
  })
}
