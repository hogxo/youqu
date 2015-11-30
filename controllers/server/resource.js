'use strict';
var mongoose = require('mongoose'),
    Resource = mongoose.model('Resource'),
    ResourceType = mongoose.model('ResourceType'),
    _ = require('underscore'),
    core = require('../../libs/core');

//列表
exports.list = function(req, res) {
    var condition = {}; 
    var obj = req.body;
    if (req.session.user) {
        obj.user = req.session.user._id;
        condition.author = obj.user;
    }
    //查数据总数
    Resource.count(condition).exec().then(function(total) {
        var query = Resource.find(condition);
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            console.log(err, results);
            ResourceType.find({}, function(err, categorys) {                
                res.render('server/resource/list', {
                    title: '游戏列表',
                    res: results,
                    categorys: categorys,
                    pageInfo: pageInfo,
                    Menu: 'list'
                });                
            });
        });
    });
    
};
//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Resource.findById(id).exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该内容不存在'
            });
        }
        result.visits = result.visits + 1;
        result.save();
        res.render('server/resource/item', {
            title: result.name,
            content: result
        });
    });
};

//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        var condition = {};
        ResourceType.find(condition).exec().then(function(categorys) {            
            //console.log(tags)
            res.render('server/resource/add', {
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
        var res = new Resource(obj);
        res.save(function(err, content) {
            if (err) {
                console.log(err);
                return res.render('server/info', {
                    message: '添加失败'
                });
            }
            res.render('server/info', {
                message: '添加成功'
            });
        });
    }
};

//删除
exports.del = function(req, res) {
    var id = req.params.id;
    Resource.findById(id).exec(function(err, result) {
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
            condition.category = type;
        }
        console.log('搜索条件：', condition);
        Resource.count(condition).exec().then(function(total) {
            if(total<=0){
                res.json({
                    success: true,
                    message: '搜索完成',
                    data: null
                });
                return;
            }
            var query = Resource.find(condition);
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
