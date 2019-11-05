$(document).ready(function () {
    activeTab();
    syncChatWorkMessage();
    syncGitTemplate();
    syncTicketContent();
});

$(document).on('keydown keyup', '#cw-message', function () {
    localStorage.chatworkMessage = $(this).val();
});

$(document).on('click', '#git-fill-template', function () {
    var description = $('#git-description').val();
    var template = $('#git-template').val();
    
    chrome.extension.sendMessage({
        type: 'fill-template',
        data: {description, template}
    });
});

$(document).on('click', '.tk-item button', function () {
    var id = $(this).attr('data-id');
    var tickets = getTickets();
    var index = tickets.findIndex(ticket => {
        return ticket.id == id;
    });

    $(this).parent('.tk-item').remove();

    if (index < 0) return;

    tickets.splice(index, 1);
    localStorage.tickets = JSON.stringify(tickets);
    $('#tk-content .tk-title').toggleClass('d-none', !tickets.length);
});

function activeTab() {
    var host = localStorage.currentHost;

    switch (true) {
        case /github/.test(host):
            $('#git-tab').addClass('active');
            $('#git-content').addClass('show active');
            break;
        case /chatwork/.test(host):
            $('#cw-tab').addClass('active');
            $('#cw-content').addClass('show active');
            break;
        default:
            $('#tk-tab').addClass('active');
            $('#tk-content').addClass('show active');
    }
}

function syncChatWorkMessage() {
    $('#cw-message').val(localStorage.chatworkMessage);
}

function syncTicketContent() {
    var ticket = getTicket();
    var tickets = getTickets();

    if (ticket) {
        $('#tk-id').val(ticket.title);
        $('#tk-description').val(ticket.description);
    }

    $('#tk-content .tk-title').toggleClass('d-none', !tickets.length);
    
    tickets.forEach(ticket => {
        var description = ticket.description;
        var url = `https://dev.sun-asterisk.com/issues/${ticket.id}`;
        var $ticketHtml = $(`
            <p class="tk-item">
                <span>${description}</span>
                <a href="${url}" target="_blank">${url}</a>
                <button data-id="${ticket.id}" class="btn btn-danger">
                    Remove
                </button>
            </p>
        `);

        $('#tk-list').append($ticketHtml);
    });
}

function syncGitTemplate() {
    var template = gitTemplate();
    var ticket = getTicket();
    var description = ticket ? ticket.title + ' ' + ticket.description : '';

    template = template.replace('$ticketId', ticket ? ticket.id : '');
    template = template.replace('$fileChanges', getFileChanges());

    $('#git-template').val(template);
    $('#git-description').val(description);
}

function getTicket() {
    return localStorage.ticket ? JSON.parse(localStorage.ticket) : null;
}

function getTickets() {
    return localStorage.tickets ? JSON.parse(localStorage.tickets) : [];
}

function getFileChanges() {
    return localStorage.fileChanges || '';
}

function gitCommitTitle(title) {
    return `git commit -m "${title}"`;
}

function gitTemplate() {
    return (
`## Related Tickets
- https://dev.framgia.com/issues/$ticketId

## WHAT this PR do?
- File changes:
$fileChanges
## HOW
- 

## WHY
- 

## Checklist
- [x] Self review in local
- [x] Check impacted areas
- [x] My code follow the RULE code of project?
- [ ] New and existing unit test pass locally with my changes?
- [x] Fill information for Related Tickets? 
- [x] Fill information for What?
- [x] Fill information for How?
- [x] Fill information for Why?

## Notes Impacted Areas
*(Impacted Areas in Application(List features, api, models or services that this PR will affect))
*(List gem, library third party add new)*
*(Checklist)*
*(Other notes)*

## Performance  (Optional)
- [ ] Resolved n + 1 query
- [ ] Time open page : 1000 ms
- [ ] Generated SQL query (please show query detail below)
` );
}
