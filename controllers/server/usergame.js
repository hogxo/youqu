'use strict';
var mongoose = require('mongoose'),
    Game = mongoose.model('Game'),
    GameType = mongoose.model('GameType'),
    UserGame = mongoose.model('UserGame'),
    _ = require('underscore'),
    core = require('../../libs/core'),
    moment = require('moment');

//列表
exports.list = function(req, res) {    
    var obj = req.body;
    if (req.session.user) {
        obj.user = req.session.user._id;
    }
    var condition = {user:obj.user}; 
    
    //查数据总数
    UserGame.count(condition).exec().then(function(total) {
        var query = UserGame.find(condition).populate('game', 'name thumb price');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            console.log(err, results);
            GameType.find({}, function(err, categorys) {                
                res.render('server/usergame/list', {
                    title: '我的游戏列表',
                    games: results,
                    categorys: categorys,
                    pageInfo: pageInfo,
                    Menu: 'usergame'
                });                
            });
        });
    });
};


//列表
exports.my = function(req, res) {    
    var obj = req.body;
    if (req.session.user) {
        obj.user = req.session.user._id;
    }
    var condition = {user:obj.user}; 
    
    //查数据总数
    UserGame.count(condition).exec().then(function(total) {
        var query = UserGame.find(condition).populate('game', 'name thumb price');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            console.log(err, results);
            for (var i = results.length - 1; i >= 0; i--) {
                var item = results[i];
                if(item.status==0){
                    item.statusname = '未发布';
                }else if(item.status==1){
                    item.statusname = '已发布';
                }else{
                    item.statusname = '已下线';                    
                }
            }
            GameType.find({}, function(err, categorys) {                
                res.render('server/usergame/my', {
                    title: '我的游戏列表',
                    games: results,
                    categorys: categorys,
                    pageInfo: pageInfo,
                    Menu: 'mygame'
                });                
            });
        });
    });
};

exports.edit = function(req, res) {
    if(req.method === 'GET') {
        var id = req.param('id');
        UserGame.findById(id).populate('game', 'name desc source').exec(function(err, result) {
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
                         
            res.render('server/usergame/edit', {
                content: result,
                Menu: 'edit'
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

//搜索
exports.search = function(req, res) {
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') {
        var condition = {};
        var ptype = req.body.ptype;     
        var key = req.body.key;
        if(key) {
            console.log('关键字为', key);
            var _key = key.replace(/([\(\)\[])/g, '\\$1');//正则bugfix
            var k = '[^\s]*' + _key + '[^\s]*';
            var reg = new RegExp(k, 'gi');
            condition.gamename = reg;
        }   
        var type = req.body.type;
        if(type){
            condition.gametype = type;
        }
        var start = req.body.start;
        var end = req.body.end;
        if(start&&end){
            condition.buytime = {'$gte':new Date(start), '$lt':new Date(end)};
        }
        console.log('搜索条件：', condition);
        UserGame.count(condition).exec().then(function(total) {
            if(total<=0){
                res.json({
                    success: true,
                    message: '搜索完成',
                    data: null
                });
                return;
            }
            var query = UserGame.find(condition).populate('game', 'name thumb price');
            //分页
            var pageInfo = core.createPage(req, total, 10);
            query.skip(pageInfo.start);
            query.limit(pageInfo.pageSize);
            query.sort({created: -1});
            query.exec(function(err, results) {
                for (var i = results.length - 1; i >= 0; i--) {
                    var item = results[i];
                    if(item.status==0){
                        item.statusname = '未发布';
                    }else if(item.status==1){
                        item.statusname = '已发布';
                    }else{
                        item.statusname = '已下线';                    
                    }
                    if(ptype==1){                        
                        item.outtime = moment(item.buytime).format('LLL');
                    }else{
                        item.outtime = moment(item.modifytime).format('LLL');
                    }
                }
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


//删除
exports.del = function(req, res) {
    var id = req.body.id;
    UserGame.findById(id).exec(function(err, result) {
        var message = '';
        if(err || !result) {
            message = '内容不存在';
            res.json({
                'success': false,
                'message': message
            });
            return;
        }
        if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
            message = '没有权限';
            res.json({
                'success': false,
                'message': message
            });
            return;
        }
        //
        result.remove(function(err) {
            var flag = true;
            if(err) {
                flag = false;
                message = '删除失败';
            }
            message = '删除成功';            
            res.json({
                'success': flag,
                'message': message
            });
        });
    });
};

exports.change = function(req, res) { 
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') { 
        var obj = req.body;
        console.log(obj.status)
        var id = obj.id;
        if(obj.type === '') {
            obj.type = null;
        }
        
        UserGame.findById(id).exec(function(err, result) {
            //console.log(result);
            if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
                return res.render('server/info', {
                    message: '没有权限'
                });
            }
            _.extend(result, {status: obj.status});
            result.save(function(err, content) {
                if(err || !content) {
                    res.json({
                        'success': false,
                        'message': '更新失败'
                    });
                }else{
                    res.json({
                        'success': true,
                        'message': '更新成功'
                    });
                }
            });
        });
    }
};