import {
    findIndex,
    getTickets,
    activeTicket,
    updateTicketList,
} from './lib/helpers.js'

chrome.extension.onMessage.addListener(
    function (request) {
        switch(request.type) {
            case 'tk-content':
                setCurrentTicket(request.data);
                break;
            case 'active-host':
                setCurrentHost(request.data.host);
        }
});

function setCurrentTicket(data) {
    var tickets = getTickets();
    var index = findIndex('id', data.id, tickets);

    if (index < 0) {
        tickets.push(data);
    }

    updateTicketList(tickets);
    activeTicket(data.id);
}

function setCurrentHost(host) {
    localStorage.currentHost = host;
}
