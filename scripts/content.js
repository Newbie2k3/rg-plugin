window.onload = function () {
    if (isOnGitHub()) {
        registerGithubPage();
    }
    
    if (isOnRedmine()) {
        syncTicketData();
        registerRedminePage();
    }
}

if (isOnChatwork()) {
    registerChatworkPage();
}

function registerChatworkPage() {
    injectJsFile();
    var interval = setInterval(function () {
        var $romTitle = $('#_roomTitle');
        if ($romTitle.length) {
            $(`<ul id="message-setting">
                    <li>
                        <input id="toall" class="rg-ckbox" type="checkbox" name="toall" value="true">
                        <label for="toall">Toall</label>
                    </li>
                    <li>
                        <input id="TOALL" class="rg-ckbox" type="checkbox" name="TOALL" value="true">
                        <label for="TOALL">TO ALL >>></label>
                    </li>
                    <li>
                        <input id="myMessage" class="rg-ckbox" type="checkbox" name="myMessage" value="true">
                        <label for="myMessage">My Chat</label>
                    </li>
                </ul>
            `).insertAfter($romTitle);
            restoreMessageSettings();
            clearInterval(interval);
        }
    }, 100);
}

function restoreMessageSettings() {
    var settings = JSON.parse(localStorage.rgMessageSettings || '{}');

    $('[name="toall"]').prop('checked', settings.toall);
    $('[name="TOALL"]').prop('checked', settings.TOALL);
    $('[name="myMessage"]').prop('checked', settings.myMessage);
}

function injectJsFile() {
    let script = document.createElement("script");
    script.src = chrome.extension.getURL('scripts/resources/chatwork.js');
    (document.documentElement).appendChild(script);
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
            <button class="btn btn-danger btn-remove">
                Remove
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

    $(document).on('click', '.btn-remove', function() {
        chrome.extension.sendMessage({
            type: 'remove-tk', 
            data: {id: data.id}
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

function isOnChatwork() {
    return window.location.origin.match('chatwork');
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
