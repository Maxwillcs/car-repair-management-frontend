import request from '@/utils/request'

// 查询库存管理列表
export function listInventory(query) {
  return request({
    url: '/biz/inventory/list',
    method: 'get',
    params: query
  })
}

// 查询库存管理详细
export function getInventory(partId) {
  return request({
    url: '/biz/inventory/' + partId,
    method: 'get'
  })
}

// 新增库存管理
export function addInventory(data) {
  return request({
    url: '/biz/inventory',
    method: 'post',
    data: data
  })
}

// 修改库存管理
export function updateInventory(data) {
  return request({
    url: '/biz/inventory',
    method: 'put',
    data: data
  })
}

// 删除库存管理
export function delInventory(partId) {
  return request({
    url: '/biz/inventory/' + partId,
    method: 'delete'
  })
}
