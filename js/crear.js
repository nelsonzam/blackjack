var roomName;
var tiempo;
var espacios;
var intervalToAnnounce;
var port = global.infoGame.udp;  

$('#crearSala').on('click',function( ev ){
    ev.preventDefault();
    var element = $('#NomSala');
    if(element.val() === ''){
      alert('No puede crear una sala sin nombre.');
    }else{
        roomName = element.val();
        global.infoGame.roomNames = roomName;
        tiempo = global.infoGame.tiempo;
        espacios = global.infoGame.espacios;
        console.log(espacios+'  '+tiempo+'  '+roomName);
        console.log(roomName);
        console.log(global.infoGame);
        window.location.href = "../html/servidor.html";
    }
});
