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
        }, function ({fileChanges}) {
            if (fileChanges) {
                updateTicket({fileChanges});
            }
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
        }, function ({url}) {
            if (!url) return;

            updateTicket({gitUrl: url});
            syncGitTemplate();
            syncChatWorkMessage();
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
    var ticketId = $(this).attr('data-id');

    activeTicket(ticketId);
    syncCurrentTicket();
    syncGitTemplate();
    syncChatWorkMessage();
});

$(document).on('click', '.btn-remove', function () {
    var ticketId = $(this).attr('data-id');

    removeTicketFromList(ticketId);
    $(this).closest('.tk-item').remove();
    $('#tk-content .tk-activity').toggleClass('d-none', !getTickets().length);
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
    var ticket = ticket || getCurrentTicket();
    var title = valueWithDefault(ticket, 'title');
    var description = valueWithDefault(ticket, 'description');

    return {
        title: title,
        description: description,
        fullTitle: title + ' ' + description,
        url: getTicketUrl(ticket),
        id: valueWithDefault(ticket, 'id'),
        gitUrl: valueWithDefault(ticket, 'gitUrl'),
        fileChanges: valueWithDefault(ticket, 'fileChanges'),
    }
}

function getTicketUrl(ticket) {
    var ticketId = valueWithDefault(ticket, 'id');

    return ticketId ? `https://dev.sun-asterisk.com/issues/${ticketId}` : '';
}

function getCurrentTicket() {
    var tickets = getTickets();
    var index = findIndex('active', true, tickets);

    return index >= 0 ? JSON.parse(tickets[index]) : null;
}

function getTickets() {
    if (!localStorage.tickets) {
        localStorage.tickets = JSON.stringify([]);
    }

    return JSON.parse(localStorage.tickets);
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

function removeTicketFromList(ticketId) {
    var tickets = getTickets();
    var index = findIndex('id', ticketId, tickets);

    tickets.splice(index, 1);
    updateTicketList(tickets);
}

function activeTicket(ticketId) {
    var tickets = getTickets();
    var indexActive = findIndex('active', true, tickets);
    var indexUpdate = findIndex('id', ticketId, tickets);

    if (indexUpdate >= 0) {
        tickets[indexUpdate].active = true;

        if (indexActive >= 0) {
            tickets[indexActive].active = false;
        }
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

function findIndex(key, value, tickets = null) {
    tickets = tickets || getTickets();

    return tickets.findIndex(ticket => ticket[key] == value);
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
    var index = findIndex('active', true);

    return index >= 0;
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
