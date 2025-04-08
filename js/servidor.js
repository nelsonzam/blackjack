var ip = global.infoGame.ipmulticast;
var port = global.infoGame.tcp;
var time = global.infoGame.tiempo;
var roomName = global.infoGame.roomName;
var portmulticast = global.infoGame.portmulticast;
var idcliente = 0;
var jugadores = new Array(new Object);
var puntaje = new Array(new Object);
var ipclientes = new Array(new Object);
var myIP = network.getMyIp();
var users = [];
var cant = global.infoGame.espacios;
var intervalToAnnounce;
var intervalMulticast;
var sendMulticast = network.multicast(portmulticast);
var template = _.template($('#players-template').html());
var ipcliente;
var cantidad_jug = global.infoGame.espacios;
var pos;
var band=0;
var jugadoresEnSala;
var turno = 0;
var clientTCP;
announceRoom(global.infoGame.roomNames,global.infoGame.tiempo,cantidad_jug,global.infoGame.udp);
    function announceRoom(room, time, space, port){
        
        intervalToAnnounce = setInterval(function(){
        var message = {
            'codigo': 1,
            'nombre': room,
            'tiempo': global.infoGame.tiempo,
            'espacios': space
        };
        if(global.infoGame.tiempo>0){
            global.infoGame.tiempo = global.infoGame.tiempo-1;
        }else{
            global.infoGame.tiempo = 120;
        }
                network.serverUDP(message,port);
        }, 1000);
        var data = {
            type: 'alert-success',
            message: 'El servidor se esta Anunciando.',
            description: 'En el puerto: ' + port
        };
    }

(function startServer(){
    var server = network.net.createServer(function(client){
        console.log('client connected');
        clientTCP = client;
        client.on('data',function(data){
            console.log(data.toString());
            var message = parseJSON(data);
            handleData(message,client);
        });
        client.on('end',function(){
            console.log('client disconected');
            var find = _.findWhere(ipclientes,{ip:client.remoteAddress});
            console.log('find:'+find);
            var data ={
                'codigo' : 11,
                'id' : find.id
            };
            console.log('Data disconnect:'+data);
            sendMulticast(data);
            var user = _.find(users,function(users){
                        return typeof(users.sock.localAddress) === 'undefined';
                    });
            removePlayer(user);
            delete user.sock;
            var index = users.indexOf(user);
            users.splice(index, 1);
        });
        client.on('error', function(err){
        if (err.code == 'ECONNRESET') { 
            console.log('Un cliente ha dejado la sala.');
            //console.log(client.remoteAddress);
            client.destroy();
        }
    });

    });
    server.listen(port,function(){
        console.log('Server listening');
    });
    function handleData( data , sock ){
        switch(data.codigo){
            case 2:
                responseConnection(data, sock);
                break;
            case 6:
                verificarBono(data,sock);
                break;
            case 8:
                envioDeCarta(data,sock);
                break;
            default:
                console.log('Codigo erroneo de JSON');
                break;
        }
    }
    function responseConnection( json, sock ){        
        if(global.infoGame.espacios <= 0){          
            var response ={
                'codigo' : 3,
                'aceptado' : false,
                'direccion': null,
                'id' : null
            };
        }else{
             idcliente = (cant - cantidad_jug)+1;
              console.log('idcliente: '+idcliente);
                var response ={
                    'codigo' : 3,
                    'aceptado' : true,
                    'direccion': ip,
                    'id' : idcliente
                };
            cantidad_jug =  cantidad_jug - 1;
            console.log('espacios: '+cantidad_jug);
            global.infoGame.espacios = cantidad_jug;
            
            sock.write(JSON.stringify(response));
            ipcliente = sock.remoteAddress;
            ipcliente = ipcliente.replace("::ffff:","");

                data = {
                playerName : json.nombre,
                ip : ipcliente,
                };
                
            pos = idcliente - 1;
            jugadores[pos]= {nombre: json.nombre, id: idcliente};
            ipclientes[pos] ={id: idcliente, ip: ipcliente}; 
            console.log(ipcliente);
            
            clearInterval(intervalToAnnounce);
            announceRoom(global.infoGame.roomNames,global.infoGame.tiempo,cantidad_jug,global.infoGame.udp);
            $('#players').append(template(data));
            users.push({
                ip: ipcliente,
                playerName: json.nombre
            });
        }
    }
    function verificarBono( json, sock){
        idbono = json.id - 1;
        if( puntaje[idbono].puntaje > 0 && json.bono === true){
                //hacer apuesta
        }
    }
    function envioDeCarta(json ,sock){
        var ida = ipclientes[turno].id;
        if(json.jugar === true){
            var data ={
                'codigo' : 9,
                'id' : ida,
                'carta' : '#x' // Llamar funcion que genera carta aleatoria
            };
            //envio carta por multicast y vuelvo a preguntar
            sendMulticast(data);
            setTimeout(function(){
             ofrecerCarta(ipclientes[turno],jugadores[turno].id);
            },500);         
        }else{
            turno = turno + 1;
            ofrecerCarta(ipclientes[turno],jugadores[turno].id);
        }
    }
    function parseJSON( json ){
        try{
            var data = JSON.parse( json );
            return data;
        }catch(err){
            console.log('Error al parsear el JSON  -' + err);
        }
    }
    function ofrecerCarta(ip,id){
    var data = {
        'codigo': 7,
        'id': id
    };
    console.log(data);
    clientTCP.write(JSON.stringify(data));
    }
    function presentacionDeJuego(cant){
    jugadores.push({nombre: 'Servidor_NPE', id:5}); 
    ipclientes.push({id: 5, ip:myIP});
        if(cant === 0){
            var data = {
                'codigo': 4,
                'jugadores': jugadores
            };
            return data;
        }
    }
    function comienzoDeRonda(points){
    jugadoresEnSala = _.size(jugadores);
    var beginRound = points;
    if(band === 0){
        for (var i = 0; i <  jugadoresEnSala - 1; i++) {
             puntaje[i] = {id: jugadores[i].id, puntaje: beginRound};
        }
    band = 1;
    }
    var data = {
        'codigo': 5,
        'puntaje': puntaje
        
    };
    return data;
    }
    function repartirCartaInicio(turn){
    var idC = ipclientes[turn].id;
        var data ={
            'codigo' : 9,
            'id' : idC,
            'carta' :'x-#'// Llamar funcion que genera carta aleatoria
        };
        //envio carta por multicast y vuelvo a preguntar
        sendMulticast(data); 
        console.log(data);  
}
$('#crearSala').on('click',function(ev){

    ev.preventDefault();
    console.log('Empezar juego');
    console.log('jugadoresb:'+jugadores);
    data = presentacionDeJuego(cantidad_jug);
    console.log(jugadores);
    console.log(data)
    ev.currentTarget.remove();
    $('#ocultar').hide();
    $('#ocultar2').hide();
    $('#players').hide();
    $('#imagen_oculta').removeClass('hide');
    $('#btn_oculta').removeClass('hide');
    sendMulticast(data);
    var data2 = comienzoDeRonda('undefined');
    console.log(data2);
    sendMulticast(data2);
    // Repartir cartas
    var n, g;
    var j = jugadoresEnSala;
    for (g = 0; g < (j)*2; g++){
            if(g >= j){
                n = g - j;
                repartirCartaInicio(n);
            }else{
            repartirCartaInicio(g);
            }
    }
    // Ofrecer Cartas
    ofrecerCarta(ipclientes[turno].ip,ipclientes[turno].id);
});
$('#repartir').on('click',function(ev){
    ev.preventDefault();
    puntaje[0] = {id: jugadores[0].id, puntaje: 2};
   // puntaje[1] ={id: jugadores[1].id, puntaje: 2};
    var data2 = comienzoDeRonda(band);
    console.log(data2);
    sendMulticast(data2);
});
function Deal() {
    var deck     = new Deck(),
        shuffle  = new Shuffle(deck),
        shuffled = shuffle.getShuffle(),
        card;

    this.getCard = function(sender) {
      this.setCard(sender);
      return card;
    };

    this.setCard = function(sender) {
      card = shuffled[0];
      shuffled.splice(card, 1);
      sender.setHand(card);
    };
}
function Deck() {
    var ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
        suits = ['t', 'p', 'd', 'c'],
        deck  = [],
        i, x, card;

    this.getDeck = function() {
      return this.setDeck();
    };

    this.setDeck = function() {
      for(i = 0; i < ranks.length; i++) {
        for(x = 0; x < suits.length; x++) {
          card = new Card({'rank': ranks[i]});

          deck.push({
            'card' : ranks[i] + suits[x]
          });
        }
      }
      return deck;
    };
}
  function Card(card) {
    this.getRank = function() {
      return card.substring(0,1);
    };

    this.getSuit = function() {
      return card.substring(1,2);
    };

    this.getValue = function() {
      var rank  = card.substring(0,1),
          value = 0;
      if(rank === 'A') {
        value = 11;
      } else if(rank === 'K') {
        value = 10;
      } else if(rank === 'Q') {
        value = 10;
      } else if(rank === 'J') {
        value = 10;
      } else {
        value = parseInt(rank, 0);
      }
      return value;
    };
  }
function Shuffle(deck) {
    var set      = deck.getDeck(),
        shuffled = [],
        card;

    this.setShuffle = function() {
      while(set.length > 0) {
        card = Math.floor(Math.random() * set.length);

        shuffled.push(set[card]);
        set.splice(card, 1);
      }

      return shuffled;
    };

    this.getShuffle = function() {  
      return this.setShuffle();
    };
  }
}());



function removePlayer(data){
    $('#'+data.playerName+'-'+ data.ip).remove();
}
