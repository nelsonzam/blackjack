$('#submit').on('click',function(ev){
	ev.preventDefault();
	var udp = $("#udp");
	var tcp = $("#tcp");
	var ipbroadcast = $('#broadcast');
	var ipmulticast = $('#ipmulticast');
	var portmulticast = $('#portmulticast');
	var tiempo = $('#tiempo');
	var espacios = $('#espacios');
	if(udp.val() === '' || tcp.val() === '' || ipbroadcast.val() === '' ||
		ipmulticast.val() === '' || portmulticast.val() === '' || tiempo.val() === '' || espacios.val() === ''){
		alert('No puede dejar un campo vacío');
	}else{
		global.infoGame.udp					= Number($("#udp").val());
		global.infoGame.tcp					= Number($("#tcp").val());
		global.infoGame.ipbroadcast			= $('#broadcast').val();
		global.infoGame.ipmulticast			= $('#ipmulticast').val();
		global.infoGame.portmulticast		= Number($('#portmulticast').val());
		global.infoGame.tiempo				= Number($('#tiempo').val());
		global.infoGame.espacios  			= Number($('#espacios').val());
		window.location.href = '../html/index.html';
	}
});
