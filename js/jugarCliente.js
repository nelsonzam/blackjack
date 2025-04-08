var ip = network.getMyIp();
console.log(ip);
var portTCP = global.infoGame.tcp;
var portmulticast = global.infoGame.portmulticast;
var upd = global.infoGame.udp;
var jugadores = new Array(new Object);
var puntaje = new Array(new Object);
var gameID;
var ofertaCarta;
var clientUDP = network.clientUDP(global.infoGame.udp);
var clientTCP;
var template = _.template($('#room-template').html());
var rooms = [];
var confirm = false;

//****************************     UNIRSE  ******************************************************
clientUDP.on('message',function(message,remote){
        console.log('Mensaje recibido: ' + message + 'remote to: ' +remote.address);
        var packet;
        var ipa =""+remote.address;
        try{
             packet =  JSON.parse(message);
        }catch(er){
            console.log(er);
        }
        if(packet.codigo == 1){
            data = {
                roomName : packet.nombre,
                tiempo: packet.tiempo,
                espacios: packet.espacios,
                ip: ipa
            };
            if(!_.contains(rooms,data.ip)){
                $('#rooms').append(template(data));
                rooms.push(data.ip);
            }
            $('#'+packet.nombre+'t').text(packet.tiempo);
            $('#'+packet.nombre+'e').text(packet.espacios);
        }
});
//------------- Conectarse a un Servidor--------------------
$('.btn-floating').on('click',function(ev){
    ev.preventDefault();
    var element = $("input[name='rooms']:checked");
    var address = element.val();
    console.log(address);
    if(typeof(address) != 'undefined'){
        global.infoGame.hostAddress = address;
        global.infoGame.roomNamec = element.attr('data-roomName');
        clientTCP = network.clientTCP(portTCP, address);
        clientTCP.on('data',function(data){
        console.log(data.toString());
        var message = parseJSON(data);
        handleData(message);
});
        comprobar(ev);
    }else{
        alert('Debe seleccionar una sala para jugar.');
    }
});

function comprobar (ev){
//------------- Solicitar entrada al Servidor--------------------
            data = {
                'codigo' : 2,
                'nombre' : global.infoGame.playerName
            };
            console.log(data);
            clientTCP.write(JSON.stringify(data));
//------------- Esperar respuesta del Servidor--------------------
        setTimeout(function(){
           console.log('aceptado: '+confirm);
            if(confirm === true){
                clientUDP.close();
                console.log('Conectado al Host: '+global.infoGame.hostAddress+' Puerto: '+ portTCP);
                ev.currentTarget.remove();
                $('#ocultar').hide();
                $('#ocultar2').hide();
                $('#rooms').hide();
                $('#imagen_oculta').removeClass('hide');
                $('#btn_oculto').removeClass('hide');
                //window.location.href = '../html/jugarCliente.html';
            }else{
                alert('No puede ingresar a una sala llena.');
            } 
        },2000);
}

//****************************  JUGAR CLIENTE  ***************************************************
hearMulticast(portmulticast);

function handleData(data){
    switch(data.codigo){
        case 3:
            aceptarSolicitud(data);
        case 4:
            presentacionJuego(data);
            break;
        case 5:
            comienzoDeRonda(data);
            break;
        case 7:
            respuestaOferta(data);
            break;
        case 9:
            recibirCarta(data);
            break;
        case 10:
            alert('Ha finalizado el juego.');
            break;
         default:
            console.log('Codigo erroneo de JSON');
            break;
    }
}
function aceptarSolicitud(data){
    if( data.aceptado === true){
        console.log(data);
        global.infoGame.ipmulticast = data.direccion;
        global.infoGame.idcliente = data.id;
        confirm = true;
    }else{
        confirm = false;
    }
}
function presentacionJuego(data){
    jugadores = data.jugadores;
  //  console.log(jugadores);
}
function comienzoDeRonda(data){
    puntaje = data.puntaje;
    console.log(puntaje);
}
function respuestaOferta(data){
    $('#pedir').on('click',function(ev){
    ofertaCarta = true;
    });
    $('#quedarse').on('click',function(ev){
    ofertaCarta = false;
    });
    var data = {
        'codigo': 8,
        'jugar': true
    };
    console.log(data);
    clientTCP.write(JSON.stringify(data)); 
}
function recibirCarta(data){
    console.log(data);
}
function parseJSON( json ){
    try{
        data = JSON.parse( json );
        return data;
    }catch(err){
        console.log('Error al parsear el JSON  -' + err);
    }
}
$('#bono').on('click',function(ev){
    ev.preventDefault();
    var data = {
                'codigo': 6,
                'id': global.infoGame.idcliente,
                'bono': true
            };
    clientTCP.write(JSON.stringify(data));    
});

function hearMulticast(multicastPort){
    var dgram = require('dgram');
    var socket = dgram.createSocket('udp4');
    var PORT = portmulticast;
    socket.bind(PORT,'0.0.0.0',function(){
        socket.setBroadcast(true);
        socket.setTTL(1);
        socket.addMembership(global.infoGame.ipmulticast,ip);
    });
    socket.on('message',function(message,rinfo){
       var data = parseJSON(message);
       handleData(data);

    });
}