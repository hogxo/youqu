'use strict';
var mongoose = require('mongoose'),
    Member = mongoose.model('WxUser'),
    MemberLevel = mongoose.model('MemberLevel'),
    _ = require('underscore'),
    core = require('../../libs/core');

//列表
exports.list = function(req, res) {    
    var obj = req.body;
    if (req.session.user) {
        obj.user = req.session.user._id;
    }
    //var condition = {user:obj.user}; 
    var condition = {};
    
    //查数据总数
    Member.count(condition).exec().then(function(total) {
        var query = Member.find(condition).populate('level', 'name photo min max remark');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            console.log(err, results);              
            res.render('server/member/list', {
                title: '我的游戏列表',
                datas: results,
                pageInfo: pageInfo,
                Menu: 'memberlist'
            });                
        });
    });
};

//单条
exports.one = function(req, res) {
    var id = req.param('id');
    Member.findById(id).exec(function(err, result) {
        console.log(result);
        if(!result) {
            return res.render('server/info', {
                message: '该内容不存在'
            });
        }
        res.render('server/member/item', {
            title: result.name,
            content: result
        });
    });
};

//修改状态
exports.change = function(req, res) { 
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') { 
        var obj = req.body;
        console.log(obj.status)
        var id = obj.id;
        if(obj.type === '') {
            obj.type = null;
        }
        
        Member.findById(id).exec(function(err, result) {
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
            condition.wechaname = reg;
        }   
        var status = req.body.status;
        if(status){
            condition.status = status;
        }
        var start = req.body.start;
        var end = req.body.end;
        if(start&&end){
            condition.created = {'$gte':new Date(start), '$lt':new Date(end)};
        }
        console.log('搜索条件：', condition);
        Member.count(condition).exec().then(function(total) {
            if(total<=0){
                res.json({
                    success: true,
                    message: '搜索完成',
                    data: null
                });
                return;
            }
            var query = Member.find(condition).populate('level', 'name photo min max remark');
            //分页
            var pageInfo = core.createPage(req, total, 10);
            query.skip(pageInfo.start);
            query.limit(pageInfo.pageSize);
            query.sort({created: -1});
            query.exec(function(err, results) {
                for (var i = results.length - 1; i >= 0; i--) {
                    var item = results[i];
                    if(item.status==0){
                        item.statusname = '停用';
                    }else if(item.status==1){
                        item.statusname = '启用';
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
    Member.findById(id).exec(function(err, result) {
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
