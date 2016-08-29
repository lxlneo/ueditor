(function () {

    UE.Editor.prototype.loadServerConfig = function () {
        var me = this;
        utils.extend(me.options, {
            imageActionName: "uploadimage", /* 执行上传图片的action名称 */
            imageFieldName: "imageFile", /* 提交的图片表单名称 */
            imageMaxSize: 5*1024000, /* 上传大小限制，单位B */
            imageAllowFiles: [".png", ".jpg", ".jpeg", ".gif", ".bmp"], /* 上传图片格式显示 */
            imageCompressEnable: true, /* 是否压缩图片,默认是true */
            /* imageCompressBorder: 1600,  图片压缩最长边限制 */
            imageInsertAlign: "none", /* 插入的图片浮动方式 */
            imageUrlPrefix: "", /* 图片访问路径前缀 */
        });
        me._serverConfigLoaded = true; // 默认已经加载了服务端配置
        me.fireEvent('serverConfigLoaded');
        return;
        setTimeout(function () {
            try {
                me.options.imageUrl && me.setOpt('serverUrl', me.options.imageUrl.replace(/^(.*[\/]).+([\.].+)$/, '$1controller$2'));

                var configUrl = me.getActionUrl('config'),
                    isJsonp = utils.isCrossDomainUrl(configUrl);

                /* 发出ajax请求 */
                me._serverConfigLoaded = false;

                configUrl && UE.ajax.request(configUrl, {
                    'method': 'GET',
                    'dataType': isJsonp ? 'jsonp' : '',
                    'onsuccess': function (r) {
                        try {
                            var config = isJsonp ? r : eval("(" + r.responseText + ")");
                            utils.extend(me.options, config);
                            me.fireEvent('serverConfigLoaded');
                            me._serverConfigLoaded = true;
                        } catch (e) {
                            showErrorMsg(me.getLang('loadconfigFormatError'));
                        }
                    },
                    'onerror': function () {
                        showErrorMsg(me.getLang('loadconfigHttpError'));
                    }
                });
            } catch (e) {
                showErrorMsg(me.getLang('loadconfigError'));
            }
        });

        function showErrorMsg(msg) {
            console && console.error(msg);
            //me.fireEvent('showMessage', {
            //    'title': msg,
            //    'type': 'error'
            //});
        }
    };

    UE.Editor.prototype.isServerConfigLoaded = function () {
        var me = this;
        return me._serverConfigLoaded || false;
    };

    UE.Editor.prototype.afterConfigReady = function (handler) {
        if (!handler || !utils.isFunction(handler)) return;
        var me = this;
        var readyHandler = function () {
            handler.apply(me, arguments);
            me.removeListener('serverConfigLoaded', readyHandler);
        };

        if (me.isServerConfigLoaded()) {
            handler.call(me, 'serverConfigLoaded');
        } else {
            me.addListener('serverConfigLoaded', readyHandler);
        }
    };

})();
