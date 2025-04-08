var ip = network.getMyIp();
var playerName;
console.log(ip);
$('#unirJugador').on('click',function( ev ){
    ev.preventDefault();
    console.log(ev);
    var element = $('#nombreJugador');
    if(element.val() === ''){
      alert('No puede jugar sin un nombre.');
    }else{
        playerName = element.val();
        global.infoGame.ip = ip;
        global.infoGame.playerName = playerName;
        console.log(global.infoGame);
        console.log(playerName);
        window.location.href = "../html/jugarCliente.html";
    }
});