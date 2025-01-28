import request from '@/utils/request'

// 查询客户管理列表
export function listCustomers(query) {
  return request({
    url: '/biz/customer/list',
    method: 'get',
    params: query
  })
}

// 查询客户管理详细
export function getCustomers(customerId) {
  return request({
    url: '/biz/customer/' + customerId,
    method: 'get'
  })
}

// 新增客户管理
export function addCustomers(data) {
  return request({
    url: '/biz/customer',
    method: 'post',
    data: data
  })
}

// 修改客户管理
export function updateCustomers(data) {
  return request({
    url: '/biz/customer',
    method: 'put',
    data: data
  })
}

// 删除客户管理
export function delCustomers(customerId) {
  return request({
    url: '/biz/customer/' + customerId,
    method: 'delete'
  })
}
