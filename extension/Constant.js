/**
 * Created by Isaac on 6/21/17.
 */

const resolutions = {
    FIT_SCREEN: {
        maxWidth: screen.width,
        maxHeight: screen.height
    },
    HIGH: {    // 1080p
        maxWidth: 1920,
        maxHeight: 1080
    },
    MEDIUM: {  //  720p
        maxWidth: 1280,
        maxHeight: 720
    },
    LOW: {     //  360p
        maxWidth: 640,
        maxHeight: 360
    }
};

const resolutionTypes = {
    HIGH: 1, // 1080p
    MEDIUM: 2,  // 720p
    LOW: 3, //360p
    FIT_SCREEN: 4,
};

const actions = {
    START : 'start',
    STOP : 'stop'
};

const defaultMinFrameRate = 30;
const defaultMaxFrameRate = 64;
const defaultAspectRatio = 16 / 9;
const defaultResolutionType = resolutionTypes.MEDIUM;
const defaultAudioBitsPerSecond = 128000;
const defaultVideoBitsPerSecond = 2500000;
const defaultRecordInterval = 1000; // milisec
const defaultMimeType = 'video/webm';