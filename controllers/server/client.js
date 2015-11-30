'use strict';
var mongoose = require('mongoose'),
    Client = mongoose.model('Client'),
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
    Client.count(condition).exec().then(function(total) {
        var query = Client.find(condition);
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            console.log(err, results);                           
            res.render('server/client/list', {
                title: '终端列表',
                res: results,
                pageInfo: pageInfo,
                Menu: 'clientList'
            });  
        });
    });    
};


//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Client.findById(id).exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该内容不存在'
            });
        }
        res.render('server/client/item', {
            title: result.name,
            content: result
        });
    });
};

//添加
exports.add = function(req, res) {
    if (req.method === 'GET') {
        var condition = {};        
        res.render('server/client/add', {
            Menu: 'clientAdd'
        });        
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.author = req.session.user._id;
        }
        var res = new Client(obj);
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
    Client.findById(id).exec(function(err, result) {
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
