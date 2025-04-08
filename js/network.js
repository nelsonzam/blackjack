var ipbroadcast = global.infoGame.ipbroadcast;
var ipmulticast = global.infoGame.ipmulticast;
var udp = global.infoGame.udp;

var network = {
    net : require('net'),
    dgram: require('dgram'),
    ip: require('ip'),
    getMyIp : function(){
        return this.ip.address();
    },
    serverUDP : function(json,port){
        var dgram = this.dgram;
        var PORT = port;
        var HOST = ipbroadcast;
        var server = dgram.createSocket('udp4');
        var message = new Buffer(JSON.stringify(json));
        server.bind(function(){
            server.setBroadcast(true);
        });

        server.send(message,0,message.length,PORT,HOST,function (err) {
            if (err) throw err;
            console.log('Message UDP sended to: ' + HOST + ' Port: ' + PORT);
            server.close();
        });
    },
    
    clientUDP: function (port){
        var dgram = this.dgram;
        var client = dgram.createSocket('udp4');
        var PORT = port;
        var HOST = '0.0.0.0';
        client.on('listening',function(){
            console.log("Server on listening:"+ HOST + ' Port:' + PORT);
        });
        client.bind(PORT,HOST);
        return client;
    },

    clientTCP : function(port,host){
        var net = this.net;      
        var client = new net.Socket();
        client.connect(port,host,function(){
            console.log('connected to: ' + host + ' ' + port);
        });
        return client;
    },

    multicast : function(multicastPort){
        var dgram = this.dgram;
        var PORT = multicastPort;
        var multicastAddress = ipmulticast;
        var server = dgram.createSocket('udp4');
        //The port bind should be changed
        console.log('port multicast :'+ PORT);
        server.bind(PORT,'0.0.0.0',function(){
            server.setBroadcast(true);
            server.setMulticastTTL(128);
            server.addMembership(multicastAddress);
        });
        var send = function(message){
            var data = new Buffer(JSON.stringify(message));
            server.send(data,0,data.length,PORT,multicastAddress,function(err){
                if (err) throw err;
                console.log('multicast sended : '+ JSON.stringify(message));
            });
        };
        return send;
    }
};