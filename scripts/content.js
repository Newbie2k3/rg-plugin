window.onload = function () {
    var title = document.querySelector('#content h2');

    if (title) {
        var subject = document.querySelector('#content .subject h3');
        var ticketId = title.textContent.split('#')[1];
        var commitTitle = title.textContent + ' ' + subject.textContent;

        var gitTemplateBtn = document.createElement('button');
        var commitTitleBtn = document.createElement('button');
        
        gitTemplateBtn.textContent = 'PR Template';
        gitTemplateBtn.classList.add('rg-btn');

        commitTitleBtn.textContent = 'Commit';
        commitTitleBtn.classList.add('rg-btn');

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
    }

    var title = document.querySelector('.compare-pr-header');

    if (title) {
        var getFileChangesBtn = document.createElement('button');
        
        getFileChangesBtn.textContent = 'Get File Changes';
        getFileChangesBtn.classList.add('btn', 'btn-primary');
        title.appendChild(getFileChangesBtn);

        getFileChangesBtn.addEventListener('click', function () {
            document.addEventListener('copy', copyFileChangesEvent);
            document.execCommand('copy');
            document.removeEventListener('copy', copyFileChangesEvent);
            getFileChangesBtn.classList.add('clicked');
            getFileChangesBtn.disabled = true;

            setTimeout(function () {
                getFileChangesBtn.classList.remove('clicked');
                getFileChangesBtn.disabled = false;
            }, 1000);
        });
    }

    function copyFileChangesEvent(event) {
        var fileChangesText = getFileChanges();
        event.clipboardData.setData('text/plain', fileChangesText);
        event.preventDefault();
    }

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
