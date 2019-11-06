chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch(request.type) {
            case 'tk-content':
                setTicket(request.data);
                break;
            case 'git-filechanges':
                setGitFileChanges(request.data.fileChanges);
                break;
            case 'active-host':
                setCurrentHost(request.data.host);
        }
});

function setTicket(data) {
    var tickets = localStorage.tickets ? JSON.parse(localStorage.tickets) : [];
    var index = tickets.findIndex(ticket => {
        return ticket.id == data.id;
    });
    index < 0 ? tickets.push(data) : tickets.splice(index, 1, data);
    localStorage.tickets = JSON.stringify(tickets);
    localStorage.ticket = JSON.stringify(data);
}

function setGitFileChanges(data) {
    localStorage.fileChanges = data;
}

function setCurrentHost(host) {
    localStorage.currentHost = host;
}
