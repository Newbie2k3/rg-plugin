chrome.extension.onMessage.addListener(function (request) {
    console.log(request.type);

    switch(request.type) {
        case 'tk-content':
            setTicket(request.data);
            break;
    }
});

function setTicket(data) {
    localStorage.ticket = JSON.stringify(data);
}
