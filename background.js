'use strict';

chrome.runtime.onInstalled.addListener(function(details) {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: 'www.youtube.com',
            pathPrefix: '/watch',
            schemes: ['http', 'https']
          }
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

var sessionMap = new Map();

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

  chrome.tabs.onUpdated.addListener(function(_tabId, changeInfo, tab) {

    if(changeInfo.url && changeInfo.url.includes("&ywf=")){
      let ywfid = getYWFIdFromUrl(changeInfo.url);
      let videoid = getVideoIdFromUrl(changeInfo.url);
      let tabId = _tabId;

      sessionMap.set(tabId, [videoid, ywfid]);
      console.log("Added session to session map: " + tabId + ": [" + videoid + ", " + ywfid + "]");
    }

  })

  chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {

    if (sessionMap.has(tabId)) {
      sessionMap.delete(tabId);
      console.log("Removed tab " + tabId);
    }

  })

});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // if (request.cmd == "any command") {
    //   sendResponse({ result: "any response from background" });
    // } else {
    //   sendResponse({ result: "error", message: `Invalid 'cmd'` });
    // }

    if(request.type == "urlVariableInfo" && sessionMap.has(request.tabId)) {
      console.log(sessionMap.get(request.tabId)[1])
      sendResponse({
        videoId: sessionMap.get(request.tabId)[0],
        ywfid: sessionMap.get(request.tabId)[1],
        tabId: request.tabId
      })
    } else {
      sendResponse({ errorMessage: "No matching tabId in sessionMap"})
    }

    return true; 
  });

/**
 * getYWFIdFromUrl returns derived ywf id from url
 * @param {*} url 
 * @returns 
 */
function getYWFIdFromUrl(url) {

  // 1.2.3.5 fixed bug here where this would parse URL incorrectly and give the wrong code

  let segments = url.split('&');

  for (var i = 0; i < segments.length; i++) {

      let segment = segments[i].split('=');

      if (segment.length == 2 && segment[0] == 'ywf') {
          return segment[1];
      }
  }

  return '';
}

/**
 * getVideoIdFromUrl returns derived videoId from url
 * @param {*} url 
 * @returns 
 */
function getVideoIdFromUrl(url) {
  let videoId = url.split('=')[1]
  videoId = videoId.split('&')[0]
  return videoId
}

// chrome.browserAction.setBadgeText({text: '10+'});
// chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
