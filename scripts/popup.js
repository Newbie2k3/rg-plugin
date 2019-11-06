$(document).ready(function () {
    activeTab();
    syncChatWorkMessage();
    syncGitTemplate();
    syncTicketContent();
});

$(document).on('keydown keyup', '#cw-message', function () {
    localStorage.chatworkMessage = $(this).val();
    syncChatWorkMessage();
});

$(document).on('click', '#git-fill-template', function () {
    chrome.tabs.getSelected(function (tab){
        chrome.tabs.sendMessage(tab.id, {
            type: 'git-filechanges'
        }, function (response) {
            var ticket = getTicket();
            ticket.fileChanges = response.fileChanges || ticket.fileChanges;
            localStorage.ticket = JSON.stringify(ticket);
            syncGitTemplate();
            chrome.tabs.getSelected(function (tab){
                var description = $('#git-description').val();
                var template = $('#git-template').val();

                chrome.tabs.sendMessage(tab.id, {
                    type: 'git-fill-template',
                    data: {description, template}
                });
            });
        });
    });
});

$(document).on('click', '#git-get-url', function () {
    chrome.tabs.getSelected(function (tab){
        chrome.tabs.sendMessage(tab.id, {
            type: 'git-get-url'
        }, function (response) {
            var ticket = getTicket();

            if (ticket) {
                ticket.gitUrl = response.url || ticket.gitUrl;
                localStorage.ticket = JSON.stringify(ticket);
                syncGitTemplate();
                syncChatWorkMessage();
            }
        });
    });
});

$(document).on('click', '#cw-fill-message', function () {
    copyText(
        chatworkMessage()
    );
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
    var ticket = transformTicket();
    var message = chatworkMessageHtml();

    var infoContent = `
        <p class="info-title">Please review my PR</p>
        <p>${ticket.fullTitle}</p>
        <p>GitHub: <a href="${ticket.gitUrl}">${ticket.gitUrl}</a></p>
        <p>Ticket: <a href="${ticket.url}">${ticket.url}</a>
    `;

    var $messageHtml = $(`
        <p class="message-content">${message}</p>
        <div class="message-info">${infoContent}</div>`
    );

    $('#cw-message-preview').html($messageHtml);
    $('#cw-message').val(localStorage.chatworkMessage);
}

function syncTicketContent() {
    var ticket = transformTicket();
    var tickets = getTickets();

    $('#tk-id').val(ticket.title);
    $('#tk-description').val(ticket.description);
    $('#tk-content .tk-title').toggleClass('d-none', !tickets.length);
    
    tickets.forEach(ticket => {
        ticket = transformTicket(ticket);
        var $ticketHtml = $(`
            <p class="tk-item">
                <span>${ticket.description}</span>
                <a href="${ticket.url}" target="_blank">${ticket.url}</a>
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
    var ticket = transformTicket();

    template = template.replace('$ticketId', ticket.id);
    template = template.replace('$fileChanges', ticket.fileChanges);

    $('#git-template').val(template);
    $('#git-description').val(ticket.fullTitle);
    $('#git-url').val(ticket.gitUrl)
}

function transformTicket(ticket = null) {
    var ticket = ticket || getTicket() || {};

    return {
        url: getTicketUrl(ticket),
        id: ticket && ticket.id ? ticket.id : '',
        title: ticket && ticket.title ? ticket.title : '',
        description: ticket && ticket.description ? ticket.description : '',
        gitUrl: ticket && ticket.gitUrl ? ticket.gitUrl : '',
        fullTitle: ticket ? ticket.title + ' ' + ticket.description : '',
        fileChanges: ticket && ticket.fileChanges ? ticket.fileChanges : '',
    }
}

function getTicketUrl(ticket = null) {
    var ticket = ticket || getTicket();
    return ticket ? `https://dev.sun-asterisk.com/issues/${ticket.id}` : ''
}

function getTicket() {
    return localStorage.ticket ? JSON.parse(localStorage.ticket) : null;
}

function getTickets() {
    return localStorage.tickets ? JSON.parse(localStorage.tickets) : [];
}

function gitCommitTitle(title) {
    return `git commit -m "${title}"`;
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

function chatworkMessageHtml() {
    var message = localStorage.chatworkMessage || '';
    var messageBage =
        `<br><div class="message-badge">
            <span>TO</span>
            <img src="images/avatar.png" />
        </div>`;

    return message.replace(/\[To:.+?\]/g, messageBage);
}

function chatworkMessage() {
    var message = localStorage.chatworkMessage;
    var ticket = transformTicket();

    return (
`${message}
[info][title]Please review my PR[/title]${ticket.fullTitle}
Github: ${ticket.gitUrl}
Ticket: ${ticket.url}
[/info]
` );
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
