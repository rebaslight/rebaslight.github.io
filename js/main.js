var jQuery = require('jquery');
var $ = jQuery;
window.$ = window.jQuery = jQuery;
require('bootstrap');
jQuery.noConflict(true);
var platform = require('platform');

var os = 'win32';//darwin, linux
var arch = 'ia32';//x64

if(platform && platform.os){
    if(/mac|apple|ios|darwin/i.test(platform.os.family)){
        os = 'darwin';
    }else if(/linux/i.test(platform.os.family)){
        os = 'linux';
    }
    if(64 == platform.os.architecture){
        arch = 'x64';
    }
}

$('.js-tabs a').click(function(e){
e.preventDefault();
    $(this).tab('show');
});

$('a[href="#build-tab-' + os + '"]').click()
