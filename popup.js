

/* 
All this is old code

$('#testbutton').click(function() {
    console.log("playbutton clicked");
    
    if(document.getElementById("playbutton").value == "Play") {
        document.getElementById("playbutton").value = "Pause";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: "document.getElementsByTagName('video')[0].play()"}
            );
        });
    } else {
        document.getElementById("playbutton").value = "Play";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.executeScript(
                tabs[0].id,
                {code: "document.getElementsByTagName('video')[0].pause()"}
            );
        });
    };
}); */

'use strict';

$(function(){

    var getURLParameter = function(url, key) {
        var searchString = '?' + url.split('?')[1];
        if (searchString === undefined) {
          return null;
        }
        var escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var regex = new RegExp('[?|&]' + escapedKey + '=' + '([^&]*)(&|$)');
        var match = regex.exec(searchString);
        if (match === null) {
          return null;
        }
        return decodeURIComponent(match[1]);
      };

    $(".connected").hide();
    $(".error").hide();

    chrome.tabs.query({
        active: true,
        currentWindow: true 
    }, function(tabs){

         var sendMessage = function(type, data, callback) {
            chrome.tabs.executeScript(tabs[0].id, {
                file: 'content_script.js'
            }, function(response) {
                if (response.errorMessage){
                    showError(response.errorMessage);
                    return;
                }
                if (callback) {
                    callback(response);
                }
            });
        }; 

        var showconnected = function(){
            // var urlwithsessionid = tabs[0].url.split('?')[0] + '?ywpid=' + encodeURIComponent(sessionId);
            $('.connected').show();
            $('.disconnected').hide();
            // $('#share-url').val(urlWithSessionId).focus().select();
        }

        var showdisconnected = function(){
            $('.disconnected').show();
            $('.connected').hide();
            $('#control-lock').prop('checked', false);
        }
        
        $('#create-session').click(function(){
            showconnected();
        });

        $('#leave-session').click(function(){
            showdisconnected();
        })
        
        // listen for clicks on the share URL box
        $('#share-url').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            $('#share-url').select();
          });
  
          // listen for clicks on the "Copy URL" link
          $('#copy-btn').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            $('#share-url').select();
            document.execCommand('copy');
          });    
    }

    );

    



});