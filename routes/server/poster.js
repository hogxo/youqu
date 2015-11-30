var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var poster = require('../../controllers/server/poster');

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

//资源列表
router.route('/').get(poster.list);
//资源列表
router.route('/list').get(poster.list);
//添加资源
router.route('/add').all(poster.add);
//编辑资源
router.route('/:id/edit').all(poster.one);
//删除资源
router.route('/:id/del').all(poster.del);
//搜索资源
router.route('/search').post(poster.search);


module.exports = function(app) {
    var path = core.translateAdminDir('/poster');
    app.use(path, router);
};
