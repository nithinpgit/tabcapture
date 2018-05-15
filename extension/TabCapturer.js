/**
 * Created by Isaac on 6/21/17.
 */

class TabCapturer {
    constructor(accountToken, presentationID, options) {
        this.accountToken = accountToken;
        this.presentationID = presentationID;
        this.mediaRecorder = null;
        this.isRecording = false;
        this.socket = null;
        this.buffer = [];

        this.resolutionType = options.resolutionType || defaultResolutionType;
        this.minFrameRate = options.minFrameRate || defaultMinFrameRate;
        this.maxFrameRate = options.maxFrameRate || defaultMaxFrameRate;
        this.audioBitsPerSecond = options.audioBitsPerSecond || defaultAudioBitsPerSecond;
        this.videoBitsPerSecond = options.videoBitsPerSecond || defaultVideoBitsPerSecond;
        this.recordInterval = options.recordInterval || defaultRecordInterval;
        this.mimeType = options.mimeType || defaultMimeType;
    }

    start() {
        let query = 'accountToken=' + this.accountToken + "&presentationID=" + this.presentationID + '&resolutionType=' + this.resolutionType;

        //this.socket = io.connect('ws://localhost', {query: query});
        this.socket = io.connect('wss://aws102.omnovia.com:9001', {query: query});

        this.socket.on('connected', () => {
            if (this.buffer.length) //we have cached data
            {
                this.buffer.forEach(data => {
                    this.sendDataToServer(data);
                });
                this.buffer = [];
            }
        });
        this.socket.on('error', (e) => {
            console.log('error ', e);
        });

        chrome.tabs.getSelected(null, (tab) => {
            this.capture();
        });
    }

    capture() {
        let resolutions = this.getResolutions();

        let constraints = {
            audio: true,
            video: true,
            videoConstraints: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    // maxWidth: resolutions.maxWidth,
                    maxHeight: resolutions.maxHeight,
                    minFrameRate: this.minFrameRate,
                    maxFrameRate: this.maxFrameRate,
                    minAspectRatio: defaultAspectRatio,
                    googLeakyBucket: true,
                    googTemporalLayeredScreencast: true
                }
            }
        };

        chrome.tabCapture.capture(constraints, this.gotStream.bind(this));
    }

    getResolutions() {

        let resolution;
        switch (this.resolutionType) {
            case resolutionTypes.FIT_SCREEN :
                resolution = resolutions.FIT_SCREEN;
                break;

            case resolutionTypes.HIGH :
                resolution = resolutions.HIGH;
                break;

            case resolutionTypes.MEDIUM :
                resolution = resolutions.MEDIUM;
                break;

            case resolutionTypes.LOW :
                resolution = resolutions.LOW;
                break;

            default:
                resolution = resolutions.MEDIUM;
        }

        return resolution;
    };

    gotStream(stream) {
        console.log('got stream for capture');

        if (!stream) {
            setDefaults();
            chrome.windows.create({
                url: "data:text/html,<h1>" + chrome.runtime.lastError.message + "Internal error occurred while capturing the screen.</h1>",
                type: 'popup',
                width: screen.width / 2,
                height: 170
            });
            return;
        }

        stream.onended = () => {
            setDefaults();
            chrome.runtime.reload();
        };

        this.sendStreamToServer(stream);

        chrome.browserAction.setIcon({
            path: 'images/pause22.png'
        });
    }

    sendStreamToServer(stream) {
        const options = {
            audioBitsPerSecond: this.audioBitsPerSecond,
            videoBitsPerSecond: this.videoBitsPerSecond,
            mimeType: this.mimeType
        };

        this.mediaRecorder = new MediaRecorder(stream, options);
        this.mediaRecorder.ondataavailable = e => {
            const blob = e.data; //new Blob([e.data], {type: 'video/mp4'});

            console.log('ondataavailable ', blob);

            let reader = new FileReader()
            reader.readAsArrayBuffer(blob);
            reader.onloadend = (event) => {
                if (this.socket.connected)
                    this.sendDataToServer(reader.result);
                else {
                    //cache it locally
                    this.buffer.push(blob);
                }
            };
        };
        this.mediaRecorder.onerror = (e) => {
            console.log('error ', e);
        };

        this.mediaRecorder.start(this.recordInterval); // each 1000 millisecond, trigger ondataavailable

        this.isRecording = true;
    }

    sendDataToServer(data) {
        this.socket.emit('data', data);
    }

    end() {
        this.mediaRecorder.stream.getTracks().forEach(track => {
            track.stop()
        });

        this.mediaRecorder.stop();
        this.isRecording = false;
        this.socket.disconnect();
        setDefaults();

        // chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
        //     if(tabs.length)
        //         chrome.tabs.remove(tabs[0].id, () => { });
        // });
    }
}
