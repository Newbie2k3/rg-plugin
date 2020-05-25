import {
    findIndex,
    getTickets,
    activeTicket,
    updateTicketList,
    removeTicketFromList,
    updateTicket
} from './lib/helpers.js'

chrome.extension.onMessage.addListener(
    function (request) {
        switch(request.type) {
            case 'set-current-tk':
                setCurrentTicket(request.data);
                break;
            case 'get-data-tk':
                setDataTicket(request.data);
                break;
            case 'remove-tk':
                removeTicket(request.data);
                break;
            case 'sync-tk':
                
                updateTicket(request.data);
                break;
            case 'sync-git-url':
                updateGitUrl(request.data);
                break;
        }
});

function updateGitUrl(data) {
    var tickets = getTickets();
    var index = tickets.findIndex(ticket => {
        let regex = new RegExp(`^${ticket.title}`);

        return regex.test(data.title);
    });

    if (index >= 0) {
        let ticket = tickets[index];

        if (ticket.gitUrl) {
            return false;
        }

        updateTicket({id: ticket.id, gitUrl: data.gitUrl})
    }
}

function setCurrentTicket(data) {
    var tickets = getTickets();
    var index = findIndex('id', data.id, tickets);

    if (index < 0) {
        tickets.push(data);
    }

    updateTicketList(tickets);
    activeTicket(data.id);
}

function setDataTicket(data) {
    if (!data.id) return;
    
    var tickets = getTickets();
    var index = findIndex('id', data.id, tickets);

    if (!tickets.length) {
        data.active = true;
    }

    if (index < 0) {
        tickets.push(data);
        updateTicketList(tickets);
    } else {
        updateTicket(data);
    }
}

function removeTicket(data) {
    removeTicketFromList(data.id);
}
