window.onload = function () {
    if (isOnGitHub()) return;

    var id = window.location.pathname.split('/').pop();
    var content = document.querySelector('#content h2');
    var title = content.textContent;
    var description = document.querySelector('.subject h3').textContent;
    var gitTemplateBtn = document.createElement('button');
    
    gitTemplateBtn.textContent = 'Get Content';
    gitTemplateBtn.classList.add('rg-btn');
    content.appendChild(gitTemplateBtn);

    gitTemplateBtn.addEventListener('click', function() {
        chrome.extension.sendMessage({
            type: 'tk-content', 
            data: {id, title, description}
        });

        setTimeout(function () {
            gitTemplateBtn.classList.remove('clicked');
            gitTemplateBtn.disabled = false;
        }, 1000);
    });
}

function gitTemplate(ticketId) {
    return (
`## Related Tickets
- https://dev.framgia.com/redmine/issues/${ticketId}

## WHAT this PR do?
- File changes:

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
- [ ] Generated SQL query (please show query detail below
`   );
}

function gitCommitTitle(title) {
    return `git commit -m "${title}"`;
}

function getFileChanges() {
    var fileChanges = document.querySelectorAll('.file-info .link-gray-dark');

    if (!fileChanges.length) return;

    var text = '';

    fileChanges.forEach(file => {
        text += '- ';
        text += file.title;
        text += '\n';
    });

    return text;
}

function isOnGitHub() {
    return window.location.origin.match('github');
}
