var express = require('express');
var router = express.Router();
var core = require('../../libs/core');
var game = require('../../controllers/server/game');
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

//游戏列表
router.route('/').get(game.list);
//添加游戏
router.route('/add').all(game.add);
//单条游戏
router.route('/:id').get(game.one);
//试玩游戏
router.route('/:id/try').all(game.try);
//更新游戏
router.route('/:id/edit').all(game.edit);
//删除游戏
router.route('/:id/del').all(game.del);
//搜索游戏
router.route('/search').post(game.search);
//购买游戏
router.route('/buy').post(usercart.add);


module.exports = function(app) {
    var path = core.translateAdminDir('/game');
    app.use(path, router);
};
