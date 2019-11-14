window.onload = function () {
    sendMessageCurrentHost();
    syncTicketData();

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
        function (request, _, sendResponse) {
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
                        gitUrl: window.location.href
                    });
                    break;
                
            }
    });
}

function registerRedminePage() {
    var data = getDataFromCurrentPage();
    var $actionContainer = $('<div class="actions"></div>');
    var $title = $('#content h2');
    var $buttons = $(`
        <div class="button-group">
            <button class="btn btn-primary btn-get-data">
                Get Data
            </button>
            <button class="btn btn-success btn-set-current">
                Set Current
            </button>
        </div>
    `);
    
    $actionContainer.append($title.clone());
    $actionContainer.append($buttons);
    $title.replaceWith($actionContainer);

    $(document).on('click', '.btn-get-data', function () {
        chrome.extension.sendMessage({
            type: 'get-data-tk', 
            data: data
        });
    });

    $(document).on('click', '.btn-set-current', function() {
        chrome.extension.sendMessage({
            type: 'set-current-tk', 
            data: data
        });
    });
}

function syncTicketData() {
    var data = getDataFromCurrentPage();

    if (data.id) {
        chrome.extension.sendMessage({
            type: 'sync-tk',
            data: data
        });
    }
}

function sendMessageCurrentHost() {
    chrome.extension.sendMessage({
        type: 'active-host',
        data: {
            host: window.location.origin
        }
    });
}

function getDataFromCurrentPage() {
    var id = getTicketId();
    var title = $('#content h2').text();
    var description = $('.subject h3').text();
    var status = $('.status .value').text();
    var done = $('.progress .percent').text();
    var estimatedTime = $('.estimated-hours .value').text();
    var spentTime = $('.spent-time .value').text();
    var assignee = $('.assigned-to .value').text();
    var targetVersion = $('.fixed-version .value').text();
    var startDate = $('.start-date .value').text();
    var dueDate = $('.due-date .value').text()

    return {
        id,
        title,
        description,
        status,
        done,
        estimatedTime,
        spentTime,
        assignee,
        targetVersion,
        startDate,
        dueDate
    };
}

function getTicketId() {
    return window.location.pathname.split('/').pop();
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
