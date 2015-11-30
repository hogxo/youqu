var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var usergame = require('../../controllers/server/usergame');

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
router.route('/').get(usergame.list);
//我的游戏
router.route('/my').get(usergame.my);
//添加游戏到购物车
router.route('/change').post(usergame.change);
//删除购物车游戏
router.route('/:id/del').all(usergame.del);
//修改游戏
router.route('/:id/edit').all(usergame.edit);
//搜索游戏
router.route('/search').post(usergame.search);

module.exports = function(app) {
    var path = core.translateAdminDir('/usergame');
    app.use(path, router);
};
