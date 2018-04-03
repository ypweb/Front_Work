var temp_sessioncache={
  "cacheMap": {
    "menuload": true,
    "powerload": true
  },
  "routeMap": {
    "prev": "",
    "current": "",
    "setting": false
  },
  "moduleMap": {
    "0": {
      "id": 0,
      "code": "app",
      "name": "首页",
      "module": "app"
    },
    "10": {
      "id": 10,
      "code": "yttx-oragnization",
      "name": "机构",
      "module": "struct"
    },
    "30": {
      "id": 30,
      "code": "yttx-order-manager",
      "name": "订单管理",
      "module": "order"
    },
    "50": {
      "id": 50,
      "code": "yttx-invoice-manager",
      "name": "发货管理",
      "module": "yttx-invoice-manager"
    },
    "70": {
      "id": 70,
      "code": "yttx-purchase-manager",
      "name": "采购管理",
      "module": "yttx-purchase-manager"
    },
    "90": {
      "id": 90,
      "code": "yttx-warehouse-manager",
      "name": "仓库管理",
      "module": "yttx-warehouse-manager"
    }
  },
  "menuMap": {
    "0": {
      "id": 0,
      "code": "app",
      "name": "首页",
      "href": "app",
      "module": "app"
    },
    "10": {
      "id": 10,
      "code": "yttx-oragnization",
      "name": "机构",
      "href": "struct",
      "module": "struct"
    },
    "30": {
      "id": 30,
      "code": "yttx-order-manager",
      "name": "订单管理",
      "href": "order",
      "module": "order"
    },
    "50": {
      "id": 50,
      "code": "yttx-invoice-manager",
      "name": "发货管理",
      "href": "yttx-invoice-manager",
      "module": "yttx-invoice-manager"
    },
    "70": {
      "id": 70,
      "code": "yttx-purchase-manager",
      "name": "采购管理",
      "href": "yttx-purchase-manager",
      "module": "yttx-purchase-manager"
    },
    "90": {
      "id": 90,
      "code": "yttx-warehouse-manager",
      "name": "仓库管理",
      "href": "yttx-warehouse-manager",
      "module": "yttx-warehouse-manager"
    }
  },
  "powerMap": {
    "0": {
      "id": 0,
      "code": "app",
      "name": "首页",
      "module": "app",
      "power": 0
    },
    "10": {
      "id": 10,
      "code": "yttx-oragnization",
      "name": "机构",
      "module": "struct",
      "power": [
        {
          "funcCode": "yttx-batch-delete",
          "funcName": "批量删除",
          "isPermit": 1,
          "modId": 10,
          "prid": 13
        },
        {
          "funcCode": "yttx-operator-adjustment",
          "funcName": "调整运营商",
          "isPermit": 1,
          "modId": 10,
          "prid": 12
        },
        {
          "funcCode": "yttx-organization-delete",
          "funcName": "删除机构",
          "isPermit": 1,
          "modId": 10,
          "prid": 11
        },
        {
          "funcCode": "yttx-organization-edit",
          "funcName": "机构编辑",
          "isPermit": 1,
          "modId": 10,
          "prid": 10
        },
        {
          "funcCode": "yttx-rolegroup-add",
          "funcName": "添加角色组",
          "isPermit": 1,
          "modId": 10,
          "prid": 9
        },
        {
          "funcCode": "yttx-role-add",
          "funcName": "添加角色",
          "isPermit": 1,
          "modId": 10,
          "prid": 8
        },
        {
          "funcCode": "yttx-role-edit",
          "funcName": "角色编辑",
          "isPermit": 1,
          "modId": 10,
          "prid": 7
        },
        {
          "funcCode": "yttx-member-delete",
          "funcName": "移除成员",
          "isPermit": 1,
          "modId": 10,
          "prid": 6
        },
        {
          "funcCode": "yttx-member-add",
          "funcName": "添加成员",
          "isPermit": 1,
          "modId": 10,
          "prid": 5
        },
        {
          "funcCode": "yttx-user-update",
          "funcName": "修改用户",
          "isPermit": 1,
          "modId": 10,
          "prid": 4
        },
        {
          "funcCode": "yttx-user-view",
          "funcName": "查看用户",
          "isPermit": 1,
          "modId": 10,
          "prid": 3
        },
        {
          "funcCode": "yttx-user-add",
          "funcName": "添加用户",
          "isPermit": 1,
          "modId": 10,
          "prid": 2
        },
        {
          "funcCode": "yttx-organization-add",
          "funcName": "添加子机构",
          "isPermit": 1,
          "modId": 10,
          "prid": 1
        }
      ]
    },
    "30": {
      "id": 30,
      "code": "yttx-order-manager",
      "name": "订单管理",
      "module": "order",
      "power": [
        {
          "funcCode": "yttx-order-details",
          "funcName": "详情",
          "isPermit": 1,
          "modId": 30,
          "prid": 15
        },
        {
          "funcCode": "yttx-order-export",
          "funcName": "导出",
          "isPermit": 1,
          "modId": 30,
          "prid": 16
        }
      ]
    },
    "50": {
      "id": 50,
      "code": "yttx-invoice-manager",
      "name": "发货管理",
      "module": "yttx-invoice-manager",
      "power": [
        {
          "funcCode": "yttx-invoice-details",
          "funcName": "详情",
          "isPermit": 1,
          "modId": 50,
          "prid": 18
        },
        {
          "funcCode": "yttx-invoice-delivery",
          "funcName": "发货",
          "isPermit": 1,
          "modId": 50,
          "prid": 19
        }
      ]
    },
    "70": {
      "id": 70,
      "code": "yttx-purchase-manager",
      "name": "采购管理",
      "module": "yttx-purchase-manager",
      "power": [
        {
          "funcCode": "yttx-purchase-audit",
          "funcName": "采购审核",
          "isPermit": 1,
          "modId": 70,
          "prid": 22
        },
        {
          "funcCode": "yttx-purchase-stats",
          "funcName": "采购统计",
          "isPermit": 1,
          "modId": 70,
          "prid": 21
        },
        {
          "funcCode": "yttx-purchase-details",
          "funcName": "详情",
          "isPermit": 1,
          "modId": 70,
          "prid": 20
        }
      ]
    },
    "90": {
      "id": 90,
      "code": "yttx-warehouse-manager",
      "name": "仓库管理",
      "module": "yttx-warehouse-manager",
      "power": [
        {
          "funcCode": "mall-storage-stats",
          "funcName": "入库统计",
          "isPermit": 1,
          "modId": 90,
          "prid": 28
        },
        {
          "funcCode": "mall-inventory-status",
          "funcName": "库存状况",
          "isPermit": 1,
          "modId": 90,
          "prid": 27
        },
        {
          "funcCode": "mall-order-stats",
          "funcName": "订单统计",
          "isPermit": 1,
          "modId": 90,
          "prid": 26
        },
        {
          "funcCode": "mall-purchase-receiving",
          "funcName": "收货",
          "isPermit": 1,
          "modId": 90,
          "prid": 25
        },
        {
          "funcCode": "mall-purchase-stats",
          "funcName": "采购统计",
          "isPermit": 1,
          "modId": 90,
          "prid": 24
        },
        {
          "funcCode": "mall-warehouse-add",
          "funcName": "添加分仓",
          "isPermit": 1,
          "modId": 90,
          "prid": 23
        }
      ]
    }
  },
  "loginMap": {
    "isLogin": true,
    "datetime": "2017-06-12|14:25:20",
    "reqdomain": "http://10.0.5.226:8883",
    "username": "admin",
    "param": {
      "adminId": "1",
      "token": "54fea119-c0f7-4f99-9223-a29d03e19fad",
      "organizationId": "1"
    }
  },
  "settingMap": {}
};
localStorage.setItem('fc_admin_unique_key',JSON.stringify(temp_sessioncache));