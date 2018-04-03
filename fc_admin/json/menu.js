/**
 * Created by Administrator on 2017/6/14 0014.
 */
var menu = {
    "code": "0", "message": "查询成功", "result": {
        "menu": [{
            "modClass": "yttx-oragnization",
            "modCode": "yttx-oragnization",
            "modId": 10,
            "modLink": "yttx-oragnization",
            "modName": "机构",
            "permitItem": [{"funcCode": "yttx-batch-delete", "funcName": "批量删除", "isPermit": 1, "modId": 10, "prid": 13}, {
                "funcCode": "yttx-operator-adjustment",
                "funcName": "调整运营商",
                "isPermit": 1,
                "modId": 10,
                "prid": 12
            }, {"funcCode": "yttx-organization-delete", "funcName": "删除机构", "isPermit": 1, "modId": 10, "prid": 11}, {
                "funcCode": "yttx-organization-edit",
                "funcName": "机构编辑",
                "isPermit": 1,
                "modId": 10,
                "prid": 10
            }, {"funcCode": "yttx-rolegroup-add", "funcName": "添加角色组", "isPermit": 1, "modId": 10, "prid": 9}, {
                "funcCode": "yttx-role-add",
                "funcName": "添加角色",
                "isPermit": 1,
                "modId": 10,
                "prid": 8
            }, {"funcCode": "yttx-role-edit", "funcName": "角色编辑", "isPermit": 1, "modId": 10, "prid": 7}, {
                "funcCode": "yttx-member-delete",
                "funcName": "移除成员",
                "isPermit": 1,
                "modId": 10,
                "prid": 6
            }, {"funcCode": "yttx-member-add", "funcName": "添加成员", "isPermit": 1, "modId": 10, "prid": 5}, {
                "funcCode": "yttx-user-update",
                "funcName": "修改用户",
                "isPermit": 1,
                "modId": 10,
                "prid": 4
            }, {"funcCode": "yttx-user-view", "funcName": "查看用户", "isPermit": 1, "modId": 10, "prid": 3}, {
                "funcCode": "yttx-user-add",
                "funcName": "添加用户",
                "isPermit": 1,
                "modId": 10,
                "prid": 2
            }, {"funcCode": "yttx-organization-add", "funcName": "添加子机构", "isPermit": 1, "modId": 10, "prid": 1}]
        }, {
            "modClass": "yttx-order-manager",
            "modCode": "yttx-order-manager",
            "modId": 30,
            "modLink": "yttx-order-manager",
            "modName": "订单管理",
            "permitItem": [{"funcCode": "yttx-order-details", "funcName": "详情", "isPermit": 1, "modId": 30, "prid": 15}, {
                "funcCode": "yttx-order-export",
                "funcName": "导出",
                "isPermit": 1,
                "modId": 30,
                "prid": 16
            }]
        }, {
            "modClass": "yttx-invoice-manager",
            "modCode": "yttx-invoice-manager",
            "modId": 50,
            "modLink": "yttx-invoice-manager",
            "modName": "发货管理",
            "permitItem": [{"funcCode": "yttx-invoice-details", "funcName": "详情", "isPermit": 1, "modId": 50, "prid": 18}, {
                "funcCode": "yttx-invoice-delivery",
                "funcName": "发货",
                "isPermit": 1,
                "modId": 50,
                "prid": 19
            }]
        }, {
            "modClass": "yttx-purchase-manager",
            "modCode": "yttx-purchase-manager",
            "modId": 70,
            "modLink": "yttx-purchase-manager",
            "modName": "采购管理",
            "permitItem": [{"funcCode": "yttx-purchase-audit", "funcName": "采购审核", "isPermit": 1, "modId": 70, "prid": 22}, {
                "funcCode": "yttx-purchase-stats",
                "funcName": "采购统计",
                "isPermit": 1,
                "modId": 70,
                "prid": 21
            }, {"funcCode": "yttx-purchase-details", "funcName": "详情", "isPermit": 1, "modId": 70, "prid": 20}]
        }, {
            "modClass": "yttx-warehouse-manager",
            "modCode": "yttx-warehouse-manager",
            "modId": 90,
            "modLink": "yttx-warehouse-manager",
            "modName": "仓库管理",
            "permitItem": [{"funcCode": "mall-storage-stats", "funcName": "入库统计", "isPermit": 1, "modId": 90, "prid": 28}, {
                "funcCode": "mall-inventory-status",
                "funcName": "库存状况",
                "isPermit": 1,
                "modId": 90,
                "prid": 27
            }, {"funcCode": "mall-order-stats", "funcName": "订单统计", "isPermit": 1, "modId": 90, "prid": 26}, {
                "funcCode": "mall-purchase-receiving",
                "funcName": "收货",
                "isPermit": 1,
                "modId": 90,
                "prid": 25
            }, {"funcCode": "mall-purchase-stats", "funcName": "采购统计", "isPermit": 1, "modId": 90, "prid": 24}, {
                "funcCode": "mall-warehouse-add",
                "funcName": "添加分仓",
                "isPermit": 1,
                "modId": 90,
                "prid": 23
            }]
        }]
    }
};