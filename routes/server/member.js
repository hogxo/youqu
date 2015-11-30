var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var member = require('../../controllers/server/member');

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

//会员列表
router.route('/').get(member.list);
//删除购物车游戏
router.route('/:id/del').all(member.del);
//修改游戏
router.route('/change').post(member.change);
//搜索游戏
router.route('/search').post(member.search);
//搜索游戏
router.route('/level').post(member.level);

module.exports = function(app) {
    var path = core.translateAdminDir('/member');
    app.use(path, router);
};
