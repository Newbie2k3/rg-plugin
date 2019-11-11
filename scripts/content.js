window.onload = function () {
    sendMessageCurrentHost();

    if (isOnGitHub()) {
        registerGithubPage();
    }
    
    if (isOnRedmine()) {
        registerRedminePage();
    }
}

window.onfocus = function () {
    sendMessageCurrentHost();
}

function registerGithubPage() {
    chrome.extension.onMessage.addListener(
        function (request, sender, sendResponse) {
            switch(request.type) {
                case 'git-filechanges':
                    var fileChanges = getFileChanges();
                    sendResponse({fileChanges});
                    break;
                case 'git-fill-template':
                    fillGitTemplate(request.data);
                    break;
                case 'git-get-url':
                    sendResponse({
                        url: window.location.href
                    });
                    break;
                
            }
    });
}

function registerRedminePage() {
    var id = window.location.pathname.split('/').pop();
    var content = document.querySelector('#content h2');
    var title = content.textContent;
    var description = document.querySelector('.subject h3').textContent;
    var gitTemplateBtn = document.createElement('button');
    
    gitTemplateBtn.textContent = 'Set Current';
    gitTemplateBtn.classList.add('btn', 'btn-success', 'btn-set-current');
    content.appendChild(gitTemplateBtn);

    gitTemplateBtn.addEventListener('click', function() {
        chrome.extension.sendMessage({
            type: 'tk-content', 
            data: {id, title, description}
        });
    });
}

function sendMessageCurrentHost() {
    chrome.extension.sendMessage({
        type: 'active-host',
        data: {
            host: window.location.origin
        }
    });
}

function isOnGitHub() {
    return window.location.origin.match('github');
}

function isOnRedmine() {
    return window.location.origin.match('dev.sun-asterisk');
}

function getFileChanges() {
    var fileChanges = document.querySelectorAll('.file-info .link-gray-dark');

    if (!fileChanges.length) return;

    var text = '';

    fileChanges.forEach(file => {
        text += file.title;
        text += '\n';
    });

    return text;
}

function fillGitTemplate(data) {
    var description = document.querySelector('[name="pull_request[title]"]');
    var template = document.querySelector('[name="pull_request[body]"]');

    if (description) {
        description.value = data.description; 
    }

    if (template) {
        template.value = data.template;
    }
}
