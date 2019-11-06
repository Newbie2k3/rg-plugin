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
            var tickets = getTickets();
            var index = tickets.findIndex(ticketItem => {
                return ticketItem.id == ticket.id;
            });
            ticket.fileChanges = response.fileChanges || ticket.fileChanges;
            tickets.splice(index, 1, ticket);
            localStorage.ticket = JSON.stringify(ticket);
            localStorage.tickets = JSON.stringify(tickets);
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
                var tickets = getTickets();
                var tickets = getTickets();
                var index = tickets.findIndex(ticketItem => {
                    return ticketItem.id == ticket.id;
                });

                ticket.gitUrl = response.url || ticket.gitUrl;
                tickets.splice(index, 1, ticket);
                localStorage.ticket = JSON.stringify(ticket);
                localStorage.tickets = JSON.stringify(tickets);
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

$(document).on('click', '#clear-all', function () {
    localStorage.clear();
    syncGitTemplate();
    syncTicketContent();
    syncChatWorkMessage();
});

$(document).on('click', '.btn-set-current', function () {
    var id = $(this).attr('data-id');
    var currentTicket = getTickets().find(ticket => {
        return ticket.id == id;
    });

    if (currentTicket) {
        localStorage.ticket = JSON.stringify(currentTicket);
        syncCurrentTicket();
        syncGitTemplate();
        syncChatWorkMessage();
    }
});

$(document).on('click', '.btn-remove', function () {
    var id = $(this).attr('data-id');
    var tickets = getTickets();
    var index = tickets.findIndex(ticket => {
        return ticket.id == id;
    });

    if (index < 0) return;

    tickets.splice(index, 1);
    localStorage.tickets = JSON.stringify(tickets);
    $(this).closest('.tk-item').remove();
    $('#tk-content .tk-activity').toggleClass('d-none', !tickets.length);
});

$(document).on('focus', '#git-content .form-control', function () {
    $(this).select();
});

$(document).on('click', '.copy-on-click', function (event) {
    var $this = $(this);
    var text = $this.text();
    copyText(text);
    copyTooltip(event.clientY, event.clientX);
});

$(document).on('click', '#tk-tab', function () {
    $('#page-title').html('Redmine');
    localStorage.currentHost = 'dev.sun-asterisk.com';
});

$(document).on('click', '#git-tab', function () {
    $('#page-title').html('Github');
    localStorage.currentHost = 'github.com';
});

$(document).on('click', '#cw-tab', function () {
    $('#page-title').html('Chatwork');
    localStorage.currentHost = 'chatwork.com';
});

function activeTab() {
    var host = localStorage.currentHost;

    switch (true) {
        case /github/.test(host):
            $('#git-tab').addClass('active');
            $('#git-content').addClass('show active');
            $('#page-title').html('Github');
            break;
        case /chatwork/.test(host):
            $('#cw-tab').addClass('active');
            $('#cw-content').addClass('show active');
            $('#page-title').html('Chatwork');
            break;
        default:
            $('#tk-tab').addClass('active');
            $('#tk-content').addClass('show active');
            $('#page-title').html('Redmine');
    }
}

function syncChatWorkMessage() {
    var message = chatworkMessageHtml();
    
    if (hasCurrentTicket()) {
        var ticket = transformTicket();
        var infoContent = `
            <p class="info-title">Please review my PR</p>
            <p>${ticket.fullTitle}</p>
            <p>GitHub: <a href="${ticket.gitUrl}">${ticket.gitUrl}</a></p>
            <p>Ticket: <a href="${ticket.url}">${ticket.url}</a>
        `;
        var $messageHtml = $(`
            <pre class="message-content">${message}</pre>
            <div class="message-info">${infoContent}</div>
        `);
    } else {
        var $messageHtml = $(`
            <pre class="message-content">${message}</pre>
        `);
    }

    $('#cw-message-preview').html($messageHtml);
    $('#cw-message').val(localStorage.chatworkMessage);
}

function syncTicketContent() {
    syncCurrentTicket();
    syncTicketList();
}

function syncCurrentTicket() {
    if (hasCurrentTicket()) {
        var ticket = transformTicket();
        var $ticketContent = $(`
            <div class="tk-mark">
                <i class="material-icons">star_border</i>
            </div>
            <p class="tk-title">${ticket.title}</p>
            <div class="tk-info">
                <p class="tk-description copy-on-click">
                    ${ticket.description}
                </p>
                <a href="${ticket.url}" target="_blank">${ticket.url}</a>
            </div>
        `);

        $('#tk-current').html($ticketContent);
    } else {
        $('#tk-current').empty();
    }
}

function syncTicketList() {
    var tickets = getTickets().map(ticket => transformTicket(ticket));

    tickets.forEach(ticket => {
        var $ticketHtml = $(`
            <div class="tk-item">
                <div class="tk-item-info">
                    <p class="copy-on-click">${ticket.description}</p>
                    <a href="${ticket.url}" target="_blank">${ticket.url}</a>
                </div>
                <div class="tk-item-action">
                    <button data-id="${ticket.id}" class="btn btn-set-current">
                        <i class="material-icons">star_border</i>
                    </button>
                    <button data-id="${ticket.id}" class="btn btn-remove">
                        <i class="material-icons">clear</i>
                    </button>
                </div>
            </div>
        `);

        $('#tk-list').append($ticketHtml);
    });

    if (tickets.length) {
        $('#tk-content .tk-activity').show();
    } else {
        $('#tk-content .tk-activity').hide();
        $('#tk-list').empty();
    }
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
    var ticket = ticket || getTicket();

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
    var ticket = ticket || getTicket() || {};
    return ticket.id ? `https://dev.sun-asterisk.com/issues/${ticket.id}` : '';
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
        `<div class="message-badge">
            <span>TO</span>
            <img src="images/avatar.png" />
        </div>`;

    return message.replace(/\[To:.+?\]/g, messageBage);
}

function copyTooltip(top, left) {
    var $tooltip = $('<span class="copy-tooltip">Copied</span>');
    $('.copy-tooltip').remove();
    $tooltip.css({top: top - 35, left: left - 30});
    $('body').append($tooltip);
    
    setTimeout(function () {
        $tooltip.addClass('tooltip-fade-out');
        setTimeout(function () {
            $tooltip.remove();
        }, 500);
    }, 200)
}

function chatworkMessage() {
    var message = localStorage.chatworkMessage || '';
    var ticket = transformTicket();

    return (
`${message}
[info][title]Please review my PR[/title]${ticket.fullTitle}
Github: ${ticket.gitUrl}
Ticket: ${ticket.url}
[/info]
` );
}

function hasCurrentTicket() {
    return !!localStorage.ticket;
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
