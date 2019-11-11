import {
    transformTicket,
    getTickets,
    copyText,
    copyTooltip,
    removeTicketFromList,
    activeTicket,
    updateTicket,
    hasCurrentTicket,
} from './lib/helpers.js';


$(document).ready(function () {
    activeTab();
    syncAll();
});

$(document).on('keydown keyup', '#cw-message', function () {
    localStorage.chatworkMessage = $(this).val();
    syncChatWorkMessage();
});

$(document).on('click', '#git-fill-template', function () {
    chrome.tabs.getSelected(function (tab){
        chrome.tabs.sendMessage(tab.id, {
            type: 'git-filechanges'
        }, function ({fileChanges}) {
            if (fileChanges) {
                updateTicket({fileChanges});
                syncGitTemplate();
            }
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
        }, function ({gitUrl}) {
            if (!gitUrl) return;
            updateTicket({gitUrl});
            syncAll();
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
    syncAll();
});

$(document).on('click', '.btn-set-current', function () {
    var ticketId = $(this).attr('data-id');

    activeTicket(ticketId);
    syncAll();
});

$(document).on('click', '.btn-remove', function () {
    var ticketId = $(this).attr('data-id');
    var tickets = getTickets();

    removeTicketFromList(ticketId, tickets);
    
    if (tickets.length) {
        activeTicket(tickets[0].id);
    }
    
    syncAll();
});

$(document).on('focus', '#git-content .form-control', function () {
    $(this).select();
});

$(document).on('click', '.copy-on-click', function (event) {
    copyText($(this).text());
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

function syncAll() {
    syncGitTemplate();
    syncTicketContent();
    syncChatWorkMessage();
}

function syncChatWorkMessage() {
    var message = chatworkMessageHtml();
    var isDisplay = hasCurrentTicket() || message;
    
    $('#cw-message').val(localStorage.chatworkMessage);

    if (!isDisplay) {
        $('#cw-message-preview').hide();
        return;
    }

    if (hasCurrentTicket()) {
        var ticket = transformTicket();
        var $messageHtml = $(`
            <pre class="message-content">${message}</pre>
            <div class="message-info">
                <p class="info-title">Please review my PR</p>
                <p>${ticket.fullTitle}</p>
                <p>GitHub: <a href="${ticket.gitUrl}">${ticket.gitUrl}</a></p>
                <p>Ticket: <a href="${ticket.url}">${ticket.url}</a>
            </div>
        `);
    } else {
        var $messageHtml = $(`
            <pre class="message-content">${message}</pre>
        `);
    }

    $('#cw-message-preview').html($messageHtml);
    $('#cw-message-preview').show();
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

    $('#tk-list').empty();

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

function chatworkMessageHtml() {
    var message = localStorage.chatworkMessage || '';
    var messageBage = `<div class="message-badge">
                            <span>TO</span>
                            <img src="images/avatar.png" />
                       </div>`;

    return message.replace(/\[To:.+?\]/g, messageBage);
}

function chatworkMessage() {
    var message = localStorage.chatworkMessage || '';
    var ticket = transformTicket();

    return (
        message + '\n' +
        '[info][title]Please review my PR[/title]' + ticket.fullTitle + '\n' +
        'Github: ' + ticket.gitUrl + '\n' +
        'Ticket: ' + ticket.url + '\n' +
        '[/info]'
    );
}

function gitTemplate() {
    return (
        '## Related Tickets\n' +
        '- https://dev.framgia.com/issues/$ticketId\n\n' +
        '## WHAT this PR do?\n' +
        '- File changes:\n' +
        '$fileChanges\n' +
        '## HOW\n' +
        '-\n\n'  +
        '## WHY\n' +
        '-\n\n'  +
        '## Checklist\n' +
        '- [x] Self review in local\n' +
        '- [x] Check impacted areas\n' +
        '- [x] My code follow the RULE code of project?\n' +
        '- [ ] New and existing unit test pass locally with my changes?\n' +
        '- [x] Fill information for Related Tickets?\n' +
        '- [x] Fill information for What?\n' +
        '- [x] Fill information for How?\n' +
        '- [x] Fill information for Why?\n\n' +
        '## Notes Impacted Areas\n' +
        '*(Impacted Areas in Application(List features,' +
        'api, models or services that this PR will affect))\n' +
        '*(List gem, library third party add new)*\n' +
        '*(Checklist)*\n' +
        '*(Other notes)*\n\n' +
        '## Performance  (Optional)\n' +
        '- [ ] Resolved n + 1 query\n' +
        '- [ ] Time open page : 1000 ms\n' +
        '- [ ] Generated SQL query (please show query detail below)\n'
    );
}
