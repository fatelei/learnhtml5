var io = require("socket.io").listen(8888);

io.sockets.on("connection", function(socket) {
	socket.on("msg", function(data) {
		socket.emit("msg", {data: data.data});
	});
});
