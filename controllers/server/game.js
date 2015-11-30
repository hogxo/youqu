'use strict';
var mongoose = require('mongoose'),
    Game = mongoose.model('Game'),
    GameType = mongoose.model('GameType'),
    UserCart = mongoose.model('UserCart'),
    _ = require('underscore'),
    core = require('../../libs/core');

//列表
exports.list = function(req, res) {
    var condition = {}; 
    var obj = req.body;
    if (req.session.user) {
        obj.user = req.session.user._id;
    }
    UserCart.find({user:obj.user}).populate('game', 'name thumb price').exec(function(err, carts) {        
        var totalprice = 0;
        for (var i = 0; i < carts.length; i++) {
            var game = carts[i].game;
            totalprice += game.price;
        }
        //查数据总数
        Game.count(condition).exec().then(function(total) {
            var query = Game.find(condition).populate('type', 'name flag').populate('author', 'name');
            //分页
            var pageInfo = core.createPage(req, total, 10);
            //console.log(pageInfo);
            query.skip(pageInfo.start);
            query.limit(pageInfo.pageSize);
            query.sort({created: -1});
            query.exec(function(err, results) {
                console.log(err, results);
                GameType.find(condition, function(err, categorys) {                
                    res.render('server/game/list', {
                        title: '游戏列表',
                        games: results,
                        categorys: categorys,
                        usercarts: carts,
                        pageInfo: pageInfo,
                        'totalprice': totalprice,
                        Menu: 'list'
                    });                
                });
            });
        });
    });
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    var nested = req.query.comment_list;
    Game.findById(id).populate('type', 'name').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该内容不存在'
            });
        }
        result.visits = result.visits + 1;
        result.save();
        res.render('server/game/item', {
            title: result.title,
            content: result,
            comment_list: nested
        });
    });
};

//试玩
exports.try = function(req, res) {
    var id = req.param('id');
    var nested = req.query.comment_list;
    Game.findById(id).populate('type', 'name').exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该游戏不存在'
            });
        }
        result.visits = result.visits + 1;
        result.save();
        res.render('server/game/try', {
            title: result.title,
            content: result,
            comment_list: nested
        });
    });
};

//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        var condition = {};
        GameType.find(condition).exec().then(function(categorys) {            
            //console.log(tags)
            res.render('server/game/add', {
                categorys: categorys,
                Menu: 'add'
            });
        })
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        if(obj.category === '') {
            obj.category = null;
        }
        var game = new Game(obj);
        game.save(function(err, content) {
            if (err) {
                console.log(err);
                return res.render('server/info', {
                    message: '创建失败'
                });
            }
            res.render('server/info', {
                message: '创建成功'
            });
        });
    }
};
exports.edit = function(req, res) {
    if(req.method === 'GET') {
        var id = req.param('id');
        Game.findById(id).populate('type', 'name').exec(function(err, result) {
            if(err) {
                console.log('加载内容失败');
            }
            if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            var condition = {};
            if(req.Roles && req.Roles.indexOf('admin') < 0) {
                condition.author = req.session.user._id;
            }
            GameType.find(condition, function(err, categorys) {                
                res.render('server/game/edit', {
                    content: result,
                    categorys: categorys,
                    Menu: 'edit'
                });                
            });
        });
    } else if(req.method === 'POST') {
        var id = req.param('id');
        var obj = req.body;
        console.log(obj);
        console.log(obj.type)
        if(obj.type === '') {
            obj.type = null;
        }
        
        Game.findById(id).populate('type', 'name').exec(function(err, result) {
            //console.log(result);
            if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            _.extend(result, obj);
            result.save(function(err, content) {
                if(err || !content) {
                    return res.render('server/info', {
                        message: '修改失败'
                    });
                }
                res.render('server/info', {
                    message: '更新成功'
                });
            });
        });
    }
};
//删除
exports.del = function(req, res) {
    var id = req.params.id;
    Game.findById(id).exec(function(err, result) {
        if(err || !result) {
            return res.render('server/info', {
                message: '内容不存在'
            });
        }
        if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
            return res.render('server/info', {
                message: '没有权限'
            });
        }
        //
        result.remove(function(err) {
            if(err) {
                return res.render('server/info', {
                    message: '删除失败'
                });
            }
            res.render('server/info', {
                message: '删除成功'
            })
        });
    });
};

//搜索
exports.search = function(req, res) {
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') {
        var condition = {};        
        var key = req.body.key;
        if(key) {
            console.log('关键字为', key);
            var _key = key.replace(/([\(\)\[])/g, '\\$1');//正则bugfix
            var k = '[^\s]*' + _key + '[^\s]*';
            var reg = new RegExp(k, 'gi');
            condition.name = reg;
        }   
        var type = req.body.type;
        if(type){
            condition.type = type;
        }
        console.log('搜索条件：', condition);
        Game.count(condition).exec().then(function(total) {
            if(total<=0){
                res.json({
                    success: true,
                    message: '搜索完成',
                    data: null
                });
                return;
            }
            var query = Game.find(condition).populate('type', 'name flag').populate('author', 'name');
            //分页
            var pageInfo = core.createPage(req, total, 10);
            query.skip(pageInfo.start);
            query.limit(pageInfo.pageSize);
            query.sort({created: -1});
            query.exec(function(err, results) {
                console.log(err, results);
                //var json = _.extend({}, _.pick(result, 'id', 'name', 'desc', 'thumb', 'email', 'type', 'author', 'created', 'created'), {});
                res.json({
                    success: true,
                    message: '搜索完成',
                    data: results
                });
            }); 
        });       
    }
};

//购买
exports.buy = function(req, res) {
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.user = req.session.user._id;
        }
        var condition = {user:obj.user, game:obj.game};
        UserCart.count(condition).exec().then(function(total) {
            if (total>0) {
                return res.json({
                    success: false,
                    message: '购物车已存在该游戏'
                });
                return;
            }
            var game = new UserCart(obj);
            game.save(function(err, content) {
                if (err) {
                    console.log(err);
                    return res.json({
                        success: false,
                        message: '购买失败'
                    });
                }

                var query = UserCart.find({user: obj.user}).populate('game', 'name thumb price');
                query.sort({created: -1});
                query.exec(function(err, results) {
                    console.log(err, results);
                    //var json = _.extend({}, _.pick(result, 'id', 'name', 'desc', 'thumb', 'email', 'type', 'author', 'created', 'created'), {});
                    res.json({
                        success: true,
                        message: '购买成功',
                        data: results
                    });
                });
            });  
        });            
    }
};