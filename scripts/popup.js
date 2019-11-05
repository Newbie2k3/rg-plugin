$(document).ready(function () {
    setInterval(function () {
        syncGitTemplate();
        syncTicketContent();
    }, 500);

    syncChatWorkMessage();
});

$(document).on('keydown keyup', '#cw-message', function () {
    localStorage.chatworkMessage = $(this).val();
});

function syncChatWorkMessage() {
    $('#cw-message').val(localStorage.chatworkMessage);
}

function syncTicketContent() {
    var ticket = getTicket();

    if (ticket) {
        $('#tk-id').val(ticket.title);
        $('#tk-description').val(ticket.description);
    }
}

function syncGitTemplate() {
    
}

function getTicket() {
    return localStorage.ticket ? JSON.parse(localStorage.ticket) : null;
}

function gitTemplate() {
    return (
`## Related Tickets
- https://dev.framgia.com/redmine/issues/${ticketId}

## WHAT this PR do?
- File changes:
${fileChanges}

## HOW
- 
- 

## WHY
- 
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
