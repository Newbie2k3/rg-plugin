window.onload = function () {
    var title = document.querySelector('#content h2');
    var subject = document.querySelector('#content .subject h3');
    var ticketId = title.textContent.split('#')[1];
    var commitTitle = title.textContent + ' ' + subject.textContent;

    var gitTemplateBtn = document.createElement('button');
    var commitTitleBtn = document.createElement('button');
    
    gitTemplateBtn.textContent = 'PR Template';
    gitTemplateBtn.classList.add('git-template-btn');

    commitTitleBtn.textContent = 'Commit';
    commitTitleBtn.classList.add('git-template-btn');

    gitTemplateBtn.addEventListener('click', function() {
        document.addEventListener('copy', copyGitTemplateEvent);
        document.execCommand('copy');
        document.removeEventListener('copy', copyGitTemplateEvent);
        gitTemplateBtn.classList.add('clicked');
        gitTemplateBtn.disabled = true;

        setTimeout(function () {
            gitTemplateBtn.classList.remove('clicked');
            gitTemplateBtn.disabled = false;
        }, 1000);
    });

    commitTitleBtn.addEventListener('click', function () {
        document.addEventListener('copy', copyCommitTitleEvent);
        document.execCommand('copy');
        document.removeEventListener('copy', copyCommitTitleEvent);
        commitTitleBtn.classList.add('clicked');
        commitTitleBtn.disabled = true;

        setTimeout(function () {
            commitTitleBtn.classList.remove('clicked');
            commitTitleBtn.disabled = false;
        }, 1000);
    })

    title.appendChild(gitTemplateBtn);
    title.appendChild(commitTitleBtn);

    function copyGitTemplateEvent(event) {
        var template = gitTemplate(ticketId);
        event.clipboardData.setData('text/plain', template);
        event.preventDefault();
    }

    function copyCommitTitleEvent(event) {
        event.clipboardData.setData('text/plain', gitCommitTitle(commitTitle));
        event.preventDefault();
    }
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
