var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var usercart = require('../../controllers/server/usercart');

//权限判断
router.use(function(req, res, next) {
    console.log('内容页: ' + Date.now());
    res.locals.Path = 'content';
    if(!req.session.user) {
        var path = core.translateAdminDir('/user/login');
        return res.redirect(path);
    }
    if(!req.Roles || (req.Roles.indexOf('admin') < 0 && req.Actions && req.Actions.indexOf('content') < 0)) {
        var path = core.translateAdminDir('/');
        return res.redirect(path);
    }
    next();
});

//购物车游戏列表
router.route('/').get(usercart.list);
//添加游戏到购物车
router.route('/add').all(usercart.add);
//删除购物车游戏
router.route('/del').all(usercart.del);
//结算
router.route('/balance').all(usercart.balance);
//搜索订单
router.route('/searchorder').post(usercart.search);
//显示订单
router.route('/:id/order').get(usercart.order);
//删除订单
router.route('/:id/delorder').post(usercart.delorder);
//支付订单
router.route('/:id/pay').get(usercart.pay);
//我的订单
router.route('/myorder').get(usercart.myorder);

module.exports = function(app) {
    var path = core.translateAdminDir('/usercart');
    app.use(path, router);
};
