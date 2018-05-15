let capturers = {};

chrome.browserAction.onClicked.addListener(() => {
    //  this is for testing purpose
    let capturer = new TabCapturer('a1', Math.floor(Date.now() / 1000), {resolutionType:resolutionTypes.HIGH});
    capturer.start();
    setTimeout(()=>{
        capturer.end();
    }, 30000);
});

let setDefaults = () => {
    chrome.browserAction.setIcon({
        path: 'images/tabCapture22.png'
    });
};

chrome.runtime.onMessageExternal.addListener(
     (request, sender, sendResponse) => {
         const actionName = request.actionName;
         const presentationID = request.presentationID;
         const accountToken = request.accountToken;

         switch (actionName)
         {
             case actions.START :
                 const options = request.options;
                 startTabCapture(accountToken, presentationID, options);
                 break;
             case actions.STOP:
                 stopTabCapture(accountToken, presentationID);
                 break;
         }
    });

let startTabCapture = (accountToken, presentationID, options) =>{
    chrome.tabs.getSelected(null, (tab) => {
        let capturer = new TabCapturer(accountToken, presentationID, options);
        capturers[accountToken + "_" + presentationID] = capturer;
        capturer.start();
        // setTimeout(()=>{
        //     capturer.end();
        // }, 15000);
    });
};

let stopTabCapture = (accountToken, presentationID) =>{
    let capturer = capturers[accountToken + "_" + presentationID];

    if(capturer)
    {
        capturer.end();

        delete capturers[accountToken + "_" + presentationID];
    }
};