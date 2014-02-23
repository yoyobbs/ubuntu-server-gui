define(function (require_browser) {
    var Backbone = require_browser('backbone'),
        App = require_browser('App');

    return Backbone.Model.extend({

        initialize: function(attributes, options) {
            if(typeof options.server === "undefined") {
                throw "Expected server to be provided.";
            }
            this.server = options.server;
        },

        connect: function() {
            if(typeof process !== 'undefined') {
                return this.initiateLocalProxy();
            } else {
                throw 'cannot connect to a server from a web browser';
            }
        },

        initiateLocalProxy: function(callback) {
            var SshConnection = require('ssh2');
            var sshProxy = this.sshProxy = new SshConnection();

            var connectOptions = {
//                debug: function(msg) {
//                    console.log(msg);
//                },
                host: this.server.get('ipv4'),
                port: this.server.get('port'),
                username: this.server.get('username')
            };

            if(this.server.get('keyPath') !== null) {
                try {
                    connectOptions.privateKey = require('fs').readFileSync(this.server.get('keyPath'));
                } catch(e) {
                    // TODO: prompt user to choose key
                    console.log('error with ssh key');
                }
            }
            else {
                // TODO: prompt for password
                connectOptions.password = 'vagrant';
            }
            sshProxy.connect(connectOptions);

            sshProxy.on('ready', _.bind(function() {
                this.server.sshProxy = sshProxy;
                this.set('connection_status', 'connected');

                // also connect via sftp
                sshProxy.sftp(_.bind(function (err, sftpConnection) {
                    this.server.sftpProxy = sftpConnection;
                    if (err) throw err;
                    sftpConnection.on('end', function () {
                        console.log('SFTP :: SFTP session closed');
                    });
                }, this));

                App.vent.trigger('server:connected', this.server);
                if(callback) {
                    callback();
                }
            }, this));

            //TODO: find a better place or logging and error trapping
            //TODO: decide how the app will handle sshProxy errors and disconnects
            sshProxy.on('error', function(err) {
                console.log('SSH Connection :: error :: ', err);
            });

            sshProxy.on('end', function() {
                App.vent.trigger('server:disconnected', this.server);
            });

            sshProxy.on('close', function(had_error) {
                App.vent.trigger('server:closed', this.server);
            });

            sshProxy.usgExec = function (cmd, options, callback) {
                sshProxy.exec(cmd, options, function (err, sshStream) {
                    if (err) {
                        throw err;
                    }
                    sshStream.on('data', function (data, extended) {
                        callback(data.toString());
                    });
                });
            }
        }

    });
});
