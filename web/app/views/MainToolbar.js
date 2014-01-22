define(function (require_browser) {
    var $ = require_browser('jquery'),
        _ = require_browser('underscore'),
        Backbone = require_browser('backbone'),
        Marionette = require_browser('marionette'),
        mainToolbarTpl = require_browser('text!views/templates/main-toolbar.html');

    return Marionette.ItemView.extend({
        template: _.template(mainToolbarTpl),
        tagName: 'header',
        id: 'main-toolbar',

        bindings: {
            'select.server-select-toggle': {
                observe: 'cid',
                updateModel: function(val, event, options) {
                    this.App.setActiveServer(this.App.servers.get(val));
                    return false;
                },
                selectOptions: {
                    collection: 'this.App.servers',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {name: 'Select/Add Server', label: 'Select/Add Server', value: null}
                }
            }
        },

        events: {
            'click .toolbar-nav li': 'onClickIcon'
        },

        triggers: {
            'click .toolbar-server_rack a': 'server:add:click'
        },

        initialize: function(options) {
            this.App = options.App;
            this.model = this.App.activeServer;
            this.App.vent.on('active-server:changed', this.onActiveServerChange, this);
        },

//        highlightIcon: function(iconClass) {
//            this.$('.toolbar-nav li').removeClass('active');
//            this.$('li.' + iconClass).addClass('active');
//        },
//
//        onClickIcon: function(e) {
//            this.highlightIcon(e.target.className);
//        },

        onRender: function() {
            this.stickit();
            this.App.servers.on('sync', this.reStickit, this);
            this.App.servers.on('add', this.reStickit, this);
        },

        onClose: function() {
            this.App.servers.off('sync', this.reStickit);
            this.App.servers.off('add', this.reStickit);
        },

        onActiveServerChange: function(server) {
            this.model = server;
        },

        reStickit: function() {
            this.stickit();
        }
    });
});
