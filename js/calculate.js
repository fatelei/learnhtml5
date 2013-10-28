var i = 0;

function timeoutCount() {
	i += 1;
	postMessage(i);
}
setInterval(timeoutCount, 500);
