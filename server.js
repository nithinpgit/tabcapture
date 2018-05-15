/**
 * Created by Isaac on 6/21/17.
 */

const local = false;
const express = require('express');
const ws = require('socket.io');
const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require('path');
const exec = require('child_process').exec;

const BEFORE_CONVERT_MEDIA_FORMAT = 'mp4';
const AFTER_CONVERT_MEDIA_FORMAT = 'mp4';
const VERSION = 1;
const app = express();
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "content-type");
    next();
});
const server = http.createServer(app);
const io = ws(server);
server.listen(80);
app.use(express.static(__dirname + '/records'));
let startMediaStreamSaving = function (accountToken, presentationID, socket, resolutionType) {
    const start = Date.now();
    const token = '12345';
    const companyPath = '.';
    const recordingPath = companyPath + '/records';
    socket.on('data', function (data) {
        const saveRecording = () => {
            if (fs.existsSync(recordingPath))
                saveDataToFile(recordingPath, token, data, function () {

                });
            else {
                fs.mkdir(recordingPath, function (error) {
                    if (error)
                        console.log(error);
                    else
                        saveDataToFile(recordingPath, token, data, function () {

                        });
                })
            }
        };


        if (fs.existsSync(companyPath))
            saveRecording();
        else {
            fs.mkdir(companyPath, function (error) {
                if (error)
                    console.log(error);
                else
                    saveRecording()
            })
        }
    });


    socket.on('disconnect', function () {
        const duration = Math.ceil((Date.now() - start) / 1000); // in sec
        endFileSaving(recordingPath, token, function (error) {
            if (error)
                logErrorMessage(accountToken, presentationID, error.message);
        });
    });
};

io.on('connection', function (socket) {
    const accountToken = socket.client.request._query.accountToken;
    const presentationID = socket.client.request._query.presentationID;
    const resolutionType = socket.client.request._query.resolutionType;

    if (accountToken && presentationID)
        startMediaStreamSaving(accountToken, presentationID, socket, resolutionType);
});


const getFileWithPath = function (path, presentationID, ext) {
    return path + '/' + presentationID + '.' + ext;
};


const endFileSaving = function (path, token, callback) {
    const before = getFileWithPath(path, token, BEFORE_CONVERT_MEDIA_FORMAT);
    const after = getFileWithPath(path, token, AFTER_CONVERT_MEDIA_FORMAT);
    console.log('before ', before);
    console.log('after', after);
    /*
    const proc = ffmpeg({source: before})
        .on('progress', function (info) {
            // console.log('progress ' + info.percent + '%');
        })
        .on('error', function (error) {
            console.log(error);
        })
        .withVideoBitrate('1024')
        .withVideoCodec('libx264')
        .withFps('24')
        .withAudioBitrate('128k')
        .withAudioCodec('aac')
        .toFormat(AFTER_CONVERT_MEDIA_FORMAT)
        .saveToFile(after, (stdout, stderr) => {
            console.log('file has been converted successfully');
        })
        .on('end', () => {
            console.log('file has been converted successfully');
        });
        */
};


const saveDataToFile = function (path, presentationID, data, callback) {
    const fileWithPath = getFileWithPath(path, presentationID, BEFORE_CONVERT_MEDIA_FORMAT);
    fs.appendFile(fileWithPath, data, function (er) {
        console.log('saved data', er ? er : '');
        callback();
    });
};
