function transformTicket(ticket = null) {
    var ticket = ticket || getCurrentTicket();
    var title = valueWithDefault(ticket, 'title');
    var description = valueWithDefault(ticket, 'description');

    return {
        title: title,
        description: description,
        url: getTicketUrl(ticket),
        id: valueWithDefault(ticket, 'id'),
        gitUrl: valueWithDefault(ticket, 'gitUrl'),
        fileChanges: valueWithDefault(ticket, 'fileChanges'),
        fullTitle: (title && description) ? title + ' ' + description : '',
    }
}

function getCurrentTicket() {
    var tickets = getTickets();
    
    return tickets.find(ticket => ticket.active);
}

function getTickets() {
    if (!localStorage.tickets) {
        localStorage.tickets = JSON.stringify([]);
    }

    return JSON.parse(localStorage.tickets);
}

function removeTicketFromList(ticketId, tickets = null) {
    tickets = tickets || getTickets();
    var index = findIndex('id', ticketId, tickets);

    if (index >= 0) {
        tickets.splice(index, 1);
        updateTicketList(tickets);
    }
}

function activeTicket(ticketId) {
    var tickets = getTickets();
    var indexActive = findIndex('active', true, tickets);
    var indexUpdate = findIndex('id', ticketId, tickets);

    if (indexUpdate >= 0) {
        if (indexActive >= 0) {
            tickets[indexActive].active = false;
        }

        tickets[indexUpdate].active = true;
    }
    
    updateTicketList(tickets);
}

function updateTicket(ticketId = null, data = null) {
    var tickets = getTickets();

    if (!data) {
        var index = findIndex('active', true, tickets);
        data = ticketId;
    } else {
        var index = findIndex('id', ticketId, tickets);
        data = data || {};
    }

    tickets[index] = {...tickets[index], ...data};
    updateTicketList(tickets);
}

function updateTicketList(tickets) {
    localStorage.tickets = JSON.stringify(tickets);
}

function getTicketUrl(ticket) {
    var ticketId = valueWithDefault(ticket, 'id');

    return ticketId ? `https://dev.sun-asterisk.com/issues/${ticketId}` : '';
}

function findIndex(key, value, tickets = null) {
    tickets = tickets || getTickets();

    return tickets.findIndex(ticket => ticket[key] == value);
}

function hasCurrentTicket() {
    return findIndex('active', true) >= 0;
}

function valueWithDefault(object, key) {
    return object && object[key] ? object[key] : '';
}

function copyText(text) {
    function handleCopy(event) {
        event.clipboardData.setData('text/plain', text);
        event.preventDefault();
    }

    document.addEventListener('copy', handleCopy);
    document.execCommand('copy');
    document.removeEventListener('copy', handleCopy);
}

function copyTooltip(top, left) {
    $('.copy-tooltip').remove();

    var $tooltip = $('<span class="copy-tooltip">Copied</span>').css({
        top: top - 35,
        left: left - 30
    });

    $('body').append($tooltip);

    setTimeout(function () {
        $tooltip.addClass('tooltip-fade-out');
        setTimeout(function () {
            $tooltip.remove();
        }, 500);
    }, 200);
}

export {
    transformTicket,
    getTicketUrl,
    getCurrentTicket,
    getTickets,
    valueWithDefault,
    copyText,
    copyTooltip,
    removeTicketFromList,
    activeTicket,
    updateTicketList,
    updateTicket,
    findIndex,
    hasCurrentTicket,
}
