// ==UserScript==
// @name		NWO::SCA bot
// @description	Neverwinter Online :: Sword Coast Adventures bot
// @version		0.15
// @author		Benio
// @match		http*://gateway.playneverwinter.com/*
// @match		http*://gatewaytest.playneverwinter.com/*
// @license		http://creativecommons.org/licenses/by/4.0/
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       none
// ==/UserScript==
/* jshint -W014 */// allow multiline operations
/* jshint laxcomma: true */// allow commas first

// fix GM_*etValue()s not working in neither Firefox nor Opera
// browser detect credits: Rob W @ //stackoverflow.com/a/9851769/1180790
// localStorage method fix credits: Andreas @ //groups.google.com/d/msg/greasemonkey-users/1gNsYNI_G4E/fNVmF1dOT5oJ
if(!!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0 || typeof InstallTrigger !== 'undefined'){
    this.GM_getValue = function(key, def){
        return localStorage[key] || def;
    };
    this.GM_setValue = function(key, value){
        return localStorage[key] = value;
    };
}

// Don`t requite jQuery as Gateway makes it already
// @require		http://code.jquery.com/jquery-latest.js

window.scaBot = window.scaBot || {};

/*
     Author: Benio @ Benio.me
     
     This bot is provided as is and may not work properly or at all.
     No guarantee nor additional notes. Follow the code and comments.
     
     As it is licensed over CC BY 4, feel free to do anything you want.
     Just note I was original author if you want to use it`s source base.
     
     Have fun. Benio.
*/

/*
    Changelog
    
    0.11     0. beta init
    0.12     1. anti stuck changes
                change frame interval to 1kms (down from 2kms)
                fix frame interval being never working
                rework frame interval to trigger click on pause then on play button in new 1kms .frameInterval
                button click wide Pause frame should occur now every 20th 1kms frame
                rework location.reload() interval to occur at 300th 1kms frame (m. interval of 5m)
             2. .dungeonSelectParty() rework
                move companion.__POWER__ sort condition to 2nd most important
                add companion.level sort condition and make 1st most important
                change minimum companion level to 30 (up from 25), its blue rarity
             3. .encounterSelectDie() fix
                dies should be rerolled now correctly if weak possibilities left only
                add progress vs power factor and new power determine way (val. 1-6)
             4. add cache to the red encounters so they are no rered anymore
             5. fix moving downstairs (higher level encounters are now deleted upon going towards the goal
             6. add boss code: fight with boss when available, display gained reward
    0.13     1. add homepage
             2. add support for gatewaytest
             3. fix load handler, adding scaBot.loadHandle
             4. fix cryptic onload error stuck, adding scaBot.loadFrames
                if load try frames reach 30 (at 30kms), reload site so unstuck propably
             5. add information about current level
             6. add reward information cache and clear button
             7. randomize frame interval time, change to 1001-3000 (up from 1000)
             8. fix GM_*etValue() on Firefox and Opera causing the bot not to load
             9. add .treasure as the highest priority encounter
            10. add white die sacrify option if choosing color is not effective
            11. add color die sacrify option when it remains best option
    0.14     1. fix treasure or boss infinity entering loop when reloaded site while entering thos encounters
             2. add searching the map backwards for treasures when reached boss with 4 or more hp
             3. change frame interval to 0.5kms + upto 1.5kms (down from 1kms + upto 2kms)
             4. make bot more venture, changing progress / power proportion comparation to 1/6th of dices left (change from 1/10th)
             5. add boss icon when boss appears to be available to fight and cache when reloading
             6. rework and rewrite .readMap() and .determineEncounter() so it is easier to read and edit
    0.15     1. make bot less venture again, changing progress / power proportion comparation to 1/10th of dices left (change from 1/6th)
             2. fix going up and down loop in boss mode when non-treasure encounter left only on higher floor
*/

// Debug. boolean
// boolean: show debug information
scaBot.debug = true;

// images (for HTML - right DIV)
/*
    all images
    
    author:  Daniele De Santis
    site:    //danieledesantis.net
    license: CC BY 4
    
    step inside scaBot.img.step`s circle
    
    author:  Yummygum
    site:    //yummygum.nl
    license: "Free for commercial use"
*/
scaBot.img = {};
scaBot.img.step = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wgBDjozN5e6mwAAAhxJREFUWMPNlz9IHFEQxn+eKycW4nF2SWUhdleYQEBCgsWFNBZpRMUiRYilkDadhRFJl8CBJE1KOe2EHNcqgmJpIXJYn5HEQESLuGm+PZZj93beU9h8sMW+nZlv3tv59yBn9DnIFoEXQBV4BIwBJX37CbSAQ6ABfAdu7suBEeAdsASMAr+BA+AEuJBMGRgHHgPDwA+gBnwEft3lhOaANvAXqGv3QQ/5fsnUpdOWDWcE2kEI7AEVDxsV6YayFbiQbwG3wJp25Yt+2biVTZMTNSksO8bQOvAwRW5ZNmuWfx7Kayv+yJEQ2O4htyaZuV7R3tZ/sxz7ITAB7Or9DHiS8Tv2xDGSJLCiyM0KuDfAPDCl2lACPgNfDGldEcdKUpE5V/pkYQF4BTwQaRh7vhr06+IqxhdnZKBqMPAcmOwijp5vBv2qZGfii5+AS2OaFIHrFAdeGtP8Upwd7ANNY9SvppCfOmROU5wUtDCm2m7BRMr6WwcHTsTZcaAUayxZ2ElZ33Vw4CLqpAWP8roBHHetXSkunFGI9fOyg95i1/tQbDawoCzOjgMt9XMrjlTb43jtoD8uTq80jHCakAmBaxpGJ9DQJDPt4EDSpPPeoDctroZvKY6wmXAC276l2KUZRZhNcOCDbzPyacdR8EbkLcN01LMd+wwkg8BT4BkwkCGbOZD4jGRWmEey/2IozX0sv8vFJHC9mOR+Ncv9cpo7/gGL7rNARxU3oQAAAABJRU5ErkJggg==';
scaBot.img.play = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACjElEQVR42sWXW4hNURjHv8GEkoiUeJKUIiVC4UGiPKCIKG/uTbnf76bkEiG58yKUKIQypPAwipRXIcUDchkTajIuv39rrdqd2Xufvc+caf/r93A6a3/rv9f6vm+tXWMFqybH2K4wFabAKBgEvf1/3+ANPIMGuAst1TLQC9bAUugLzfAUXsIXP6YPDIHR0BM+w0k4CE3tMTAPjvgJrsMpeACtCeO7wCRYAjO9wRVwOa8BBTrmAzXCMniRZUkjGgEnYJw3XhdnPM6AJr/i3+AAbIY/OScP6gx7YJ1fwTmlJuIMaO8Ww2o4XOHEpVoJh+C0uVxKNKA9vwT7YUOVJg/aB+thvkVyImpA2a7MfgUTLHnZtacfzZVdHmk7HsNgcxXTVGqg3tx+j7TkhJsGt+AvHIWt8CuHCSXmc3N5sS1qQE3mPTyCWSkB9NBueOhXSauw0P/OqmswEQZCSzAwHW6Y63QNKQ/vgJ3euAyc9UuqxFXO/MhgQJ1UnXIG3AwGVPMLzDWc1pSHowak7n5FVsE7c9Vzr4wBlbka1AWoC4GeePeTyzxcaiBoDJyHoXAO1sL3lDj3oQeMDYE+wVVYXqEBSXm03VzTUZWo6TQmxDkOs6FfCPQb9prPzAoNBKmK7pgr4wEJY1RxG6G2IwwMN5dknaA//MtioBpbUAtbYJO5+8FcSy7PNlvQ3iTUBUVJOAwumjuCv6bEaZOElZZhN9hl7uD6YO6guV3mJWLLsJJGNN5cI1JfP2Mu+5utvGIbUdZWrN5f78fJwFtYZO6WlFWxrdgs/2GkbVPS/cwxeeJhJOU5jlU1r3NMLJU9jqVCLyRBhV7JpMIvpcFEYdfyqAr7MImq0E+zqAr7OO1Q/QfSAcgh/1XQIwAAAABJRU5ErkJggg==';
scaBot.img.pause = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB90lEQVR42s3XT0iUQRjH8VlSPCTiPzp5kgg8BaJgB0NE8qZBEhh4zZIFJbEkWFQCMaVQECuvQUEYqDcXkbCDQiF4EkQ6dQotCT2ILfV9eJ+B4eV9bVc3px98TjP7zvPOzDv7vgnjOYkc+hahFTdQh2qUadsPfMFnpLGEo3wVUIp+3EMlfuITtrGnfSpwBfUowS5e4hn2z1JAJ6Z0gHm8wgp+xfQvQDO6cVML7MXbXAuQC03rhdZwH5vZTKmTq3iBa1p4MqrwqAJk8Hd6BxN4jEyOg9tcwCgGdAZvh4uIKkDW7i4eYPKUA4fTh+eYNcFeii1A1vwNxvEoT4PbPMVD3DHOnnALkN0uO3sHjSZ62i+aYLdLv8Mc2iSyHB9xWfvthwt4YoL1rjXRG64J71GO77iFD1m0uZGNuWGCfZFyC5BD5itW9cdR2dJZGcKI3lFNFm3hSKHXUYUjW0AbFkxw0qVjfpjRWRpWKR3ob23hyEkqJ2U7Fm0B8sx3meDAiTtkfuvFR/ROh50ZPKktHHnM5YB6jaTttI4DtJj45KsAyTKK0WA7fcMces6pgBl04JLtdIwxozvzHAqQ/TKIwv+mAO9L4H0Ten8MvR9E3o9iYzz/GUm8/x1LvL6Q2Hh9JZN4fym1RXh7LXfj7cPEjddPMzfePk7/af4AgALqITH0FC4AAAAASUVORK5CYII=';
scaBot.img.stop = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACGElEQVR42s3XT0gUYRjH8XfJP5dQw/QUSRJeg8g/HewQUZ1UUESFrqUiGIoWlacktFAUpNJroCgK5kmX8GCHskTwKmIQnfyDJl3WCv0+vO8Lwziys7rt2wOfy87svL9553nfnY0oxxVJ4NxM3MFtXEMhzpljO1jHEqKYQyxZAXLQjkacxx6+YhXb5pxcFKEYWdjCW/Rh9zQB6jFoBpjGMObx55jz03ATD1BlArZiLNEAcqEhc6FPaMJKmCn11BW8wXUTvCUoeFAAGXzC3MErPMHfBAe3dQYv0GFmsNYfIiiAPLv7aMPACQf210P0Y0TpXjo2gDzzUbzEoyQNbqsXnWhQnp7wBpBul85eQ7k6Ou15uKTiN+4BvmHT97k8jo+4rPSK2fUHeK70876qjjacNJAsqYyQd7uv9NId8n0ujbmsdF90eQPIJvMDC6gOuHM59h3PVJx1bWayGxdxIWAmpnDDHIvZABV4r/ROF/V9oQSLqMN4yBmoNeeW4ovvmOykslNWYsYGkKm6p/SG41+rcpHPuGu+GKbkRmZRZsJ7S5a5bFDv0GIDyAC/cCvgYskOIPUBZ+W4DbCBSTSnKMBr1CDfBviNHmU6MwUBZMU9Rvp/E8D5I3DehM6XofONKOxW/BQ/4wyerfRWXKAS2IqlnP4YSTn/OZZy+kJiy+krmZTzl1Ibwtlrubec/THxltO/Zt5y9uf0n9YhrbHMIfHAQ9UAAAAASUVORK5CYII=';
scaBot.img.stairs = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADv0lEQVR4Xu1aN6gVQRR931yICRRMYKWCAQsbwVRoIYKFFmZQQQyg+AULA1ioCCKCGUEszIidYEAsTJ1gBEWsjIWgIoo5nCO7MH+dfTN7d5a3szsDh//+e3dm7jl778Rta9S8tNWcfyMIECKg5gqEFKh5AHg7CE7AgxsG/BY8QEb9NeAt6/qaAufh+xwB+bjKFHy44bMAZ+D8vBwCTELdW0EAj1MgRIAmBf5kGBQ5BtyuWgpcAqHNFuMCB/6nwKeqCXAShBZbCNDBxNdpUDcGnAazhUGAjAr4GgGnwHNBgqv3ETAZhDYAHM2bFf4+HhhUNQEWgdCJjBGsmnsfAfPBhiSkJQjg+yyQNwLOQYC5WcOnTLOAToBf0arthwWxi7DZaGFX2oWQToB38HYc8MqCGGcH0wzyXzNljwAKMAZ4bSGAyMQHAcZaRoD3AnAAO5tgwQjwWoDOINAf6GR4PDzcnA0crJoAA0HoJtDXIAAHr+5Az6oJMBiEHgF9RAnaaHifAhTgAdAvCCBToPYR8AW6DQdeyvQz1yp6HZCWAhwYH1rMDp9hsx34YKYis2iVAMvh7lGZy25rtUqA1aBx2C0VWWtBAJlu1rUGwPKxZhr0PgKGgBSXuKbtJwXgQUXvhGQuBWAUtwMzgDvRoMnB06pIU+AAWl9p6IHisH3uB5LFlQBsfw+wTulgCz7vsGIfOWhrq9pxADMJ0KxdFwLoyLNP3hol7wxSfZFGwCG0uEqiXFSnmQB8eYHichG0G3ii6SeN/HfYzgKu2PpWNgG4Z7gHDI0I8Ap7KvBTIZRGnueGFO6YLXnatUqAteh7v8bRkfjuPtAt+u0N/o4C3kf/OyXvWoC7aHCXpfocrZ9pbEdEEdAj+o2HoTwTpADOybsW4AIaZP7lKToBGAEfgeRoz35EYa866DIFeC4/Mw971E0K8ALfjQa2AusTbecm7zoCihCAKXAVWFIE+TwC7EPlNQmnihBAF1BOnnzcsJoCXNpOtwhhrvCWAdNaIMBX9LkCOG7hp5WJKgBfULhuVUtvVHQE8J5wG3AE6Bq5wIfBd36/Sf1WBZiIRnhSIy1FC8C7A06HXRIOcjrl22HcdWYuZRSAp8jxQsiW0F4Yqhsi23odVoJliAAuhXmPwAuVLGUnjDdlqRDbqhHATci/V8iF5TLqcU+et/CKjLluuk2K+2HoLwWeSzpWBeiFBrjokBbmpygPNR3ymixeDpv84SrRdDCT2oZ0JWhyypvfgwDePKqCHA0RUJCw3jQbIsCbR1WQo38B4W/NQWgBWNgAAAAASUVORK5CYII=';
scaBot.img.boss = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wgHDCArsjlTpAAAA4NJREFUWMO911uIVVUYB/DfaDNZY5Z2IywjLYsKouxCGWSg3bByoCChHjKDXiIregjKAt9qKiKiELoQktplIruRlQ0+pA85NkQFkVqY1URmk2jlTHN6+R/YbfY5Hp2pDxZ73b7L+q/vsjb/L41rtjgRa7APx/1HBryJH3FReWEqNuFVPIrX0DbGyk/Fd5iLH3BfcbELtVjWn/6lY6j88Mgdwi1YHyT+RQuj+G5swCeFtQcD3zd4vsldzovgnuw/OvPzI7v+7W1k6fJsuA6fYknmf0V7rmUrLmvAX8PlBaOfQicGcBp24XecUGco33MH+vBVnPIoHB/DXsFkfIyzsL3CgF68Hx8ah41R2hc5M3BDCd1KGIexCFswJxb/kjt8pwnv+diDkThZewx+EauwthWHmRwoVyQ6uvA5rsZhLfB3YkpOvzJI3BaZDzdKDO14HYO57zvxMh7CTbn3ruxZjnuipEwTsAw7MR2bA39HHLAebUOYWWS8EN/nhBPiZGvjPNMwKbFbS/sjqEwqyJiC3woK5mf+ixiyMeMj8Di+LCPQgXMynh3GXViN3bgx6NRPejbeTox3RMGRWX8ra0viyFsL2W9i9k8pJ4onYv2WfPfiz/R7YuyyAgr19lw8vz7eFWRmF+b+DmoDGf+E06scaGquolbRupMbavtpb+D2grJyaxZFJhU2jrSg7GBafxCvpGdKsNX7w1iAO5oYt73UX1iSUSs46DGN6vOhDWp3b8JqOOV6B07GB1m/C1dFYX/Wvq7ItHvThhohMKcBbPdn/ZSMLw5aXYmMtoTWCN7D+GTOKllr9pfJ9lQwzcr3VqwrXMUZQaWG8+LdtTjrlRVy/irXoEMqDLgWH5XmNiVXDKeqbcspF+OapNpv8+D4OaG8vkL24kLVbErPlixfi0dSXvcm4z0dyLuxtMBzb5LMkyUZqw70FbO6xbDa08Dbi21HKW23ROPxwkHE+VCFQbMO9i3Xic8OQPnO0ngfrhjtg7IjztWKAYM5bb2uLBqrV+30lOPNiYJ3GxiwO1VyXELy3LEy4MQomJfxtiYorMueGRmfNBYGDOKS9FdUON1QqYgtzd4HEq6josfwUqLi5ijY2OD0fTizMO7KdY2KuvMzsjNZbkHmV5aUf5gnXRuOzSN2ID8qo/rN64mCuRUP0N7k9w0NeKcll4yKrscFTZLVzAY1pSX6Bz3XkLJh0KQ7AAAAAElFTkSuQmCC';

// chronological event list
/*
	0.		onload
	1.	    onhashchange	Init / bot start
    2.		hashCheck		Check if we are on Sword Coast Adventures
    3.		load			Load button to manually begin bot work
    4.		think			Think about what action take, then exec it
*/

// description
/*
    both .onload() and all hashchange executes .onhashchange()
    .onhashchange() loads .hashCheck()
    .hashCheck() loads .load() if we are on adventures
    .load() creates HTML - right DIV panel using .img
    .think() finally starts thinking metod (main thinking process)
        usually fired from panel, on execute determines what to do.
        if there is a way to do, fire it, otherwise do nothing.
        
        in autorun mode, executed at scaBot.play interval
*/

// vars
scaBot.level = -1;
scaBot.frames = 0;
scaBot.loadFrames = 0;
scaBot.loadHandle = undefined;
scaBot.frameHandle = undefined;
scaBot.frameResume = undefined;
scaBot.frameInterval = function(){
    return (500 + Math.random() * 1500);
};

// basic frame that .think()s
/*
    try{} wide transaction (may stuck prevent)
    button wide internal pause every 30th frame (may unheap)
    reload every 300th frame (may unstuck, needs to GM_setValue all session wide vars)
*/
// @noparam
scaBot.frame = function(){
    scaBot.frames = scaBot.frames + 1;
    
    try {
        scaBot.think();
    } finally {
        if(scaBot.frames % 300 === 0){
            scaBot.saveAndReload();
            return;
        }

        if(scaBot.frames % 30 === 0){
            $('#SCAbotButtonsPause').trigger('click');
            scaBot.frameResume = setTimeout(function(){$('#SCAbotButtonsPlay').trigger('click');}, scaBot.frameInterval());
        } else {
            scaBot.frameHandle = setTimeout(scaBot.frame, scaBot.frameInterval());
        }
    }
};

// save all important vars and reloads site
// @noparam
scaBot.saveAndReload = function(){
    GM_setValue('resume_autorun', true);
    GM_setValue('level', scaBot.level);
    GM_setValue('rewards', $('#SCAbotLog').html());
    GM_setValue('boss', scaBot.boss);
    location.reload();
};

// add reward log entry on the bottom of right bot panel
// @param entry entry to add
scaBot.log = function(entry){
    $log = $('#SCAbotLog').html();
    
    if($log !== ''){
        $('#SCAbotLog').append($('<br>'));
    }
    
    $('#SCAbotLog').append(entry);
    document.getElementById('SCAbotLog').scrollTop = document.getElementById('SCAbotLog').scrollHeight;
    
    $('#SCAbotLogOK').show();
};

// is status updated already?
// determines if remove original info as placeholder when there is no status updated yet
scaBot.statusUpdated = false;

// update status on right bot panel
/*
    @param entry entry to add
    @param add   
                 false: replace current status with entry
                 true:  add entry to the end of current status
*/
scaBot.status = function(entry, add){
    $status = $('#SCAbotStatus').html();
    
    // don`t append data to initial status, just replace it even if add parameter was passed
    if(!scaBot.statusUpdated){
        scaBot.statusUpdated = true;
        add = false;
    }
    
    if(add){
        if($status !== ''){
            $('#SCAbotStatus').append($('<br>'));
        }
        
        $('#SCAbotStatus').append(entry);
    } else {
        $('#SCAbotStatus').html(entry);
    }
    
    document.getElementById('SCAbotStatus').scrollTop = document.getElementById('SCAbotStatus').scrollHeight;
};

// set user language
// @param lang lang to set ('en' etc)
scaBot.setLang = function(lang){
    GM_setValue('lang', lang);
};

// remove reward cache
// @noparam
scaBot.removeRewardsCache = function(){
    GM_setValue('rewards', '');
};

// translate entry to user language
/*
    @param  entry object {LANGUAGE: TRANSLATED_ENTRY},           ex. {'en': 'text', 'pl': 'tekst'}
    @return translated entry with GM_getValue('lang', 'en') key, ex. 'text'
*/
scaBot.translate = function(entries){
    return entries[GM_getValue('lang', 'en')];
};

// 2. hashCheck
// if we are in adventures - enable bot, otherwise - disable
// @noparam
scaBot.hashCheck = function(){
    if(document.location.hash.substr(1).match(
        /char(.*@.*)\/adventures/g
    )){
        scaBot.load();
    } else {
        clearTimeout(scaBot.loadHandle);
        clearTimeout(scaBot.frameHandle);
        clearTimeout(scaBot.frameResume);
        $('#SCAbot').remove();
    }
};

// 3. load
// make #SCAbot div - bot panel
// @noparam
scaBot.load = function(){
    if($('.sca-options').length){
        scaBot.loadFrames = 0;
        
        if(scaBot.debug){
            console.info('[NWO::SCA bot] .load(): Bot is ready to use (press Play to start or Step to debug).');
        }
        
        // remove old panel and tasks
        clearTimeout(scaBot.loadHandle);
        clearTimeout(scaBot.frameHandle);
        clearTimeout(scaBot.frameResume);
        $('#SCAbot').remove();
        
        ////////// PANEL
        ////////// HTML - right DIV /
        
        $('body').prepend($('<div>').css({
            'position': 'fixed',
            'top': 0,
            'right': 0,
            'background': 'white',
            'width': '300px',
            'height': '100%',
            'padding': '10px',
            'z-index': '1337',
            'font-family': '"Sava" "StoneSans" monospace',
            'font-size': '20px',
            'text-align': 'center',
            'cursor': 'default',
        }).attr('id', 'SCAbot'));
        
        $('#SCAbot').append($('<span>').html(scaBot.translate({'en':'Sword Coast Adventures :: Bot', 'pl':'Przygody Wybrzeża Mieczy :: Bot'})).css({
            'display': 'block',
            'height': '30px',
        }));
        
        $('#SCAbot').append($('<div>').css({
            'margin-top': '10px',
            'height': '42px',
        }).attr('id', 'SCAbotButtons'));
        
        // button - Step
        $('#SCAbotButtons')
            .append($('<a>')
            .attr('href', '#')
            .css('margin', '10px')
            .attr('title', scaBot.translate({'en':'Step', 'pl':'Krok'}))
            .html($('<img>')
            .css('border-radius', '32px')
            .attr('src', 'data:image/png;base64,' +scaBot.img.step))
            .attr('onclick', 'scaBot.think(); return false;'));
        
        // button - Play
        $('#SCAbotButtons')
            .append($('<a>')
            .attr('href', '#')
            .css('margin', '10px')
            .attr('title', scaBot.translate({'en':'Play', 'pl':'Start'}))
            .attr('id', 'SCAbotButtonsPlay')
            .html($('<img>')
            .css('border-radius', '32px')
            .css('background', '#cfa')
            .attr('src', 'data:image/png;base64,' +scaBot.img.play))
            .attr('onclick', 'scaBot.frameHandle = setTimeout(scaBot.frame, scaBot.frameInterval()); $(this).find(\'img\').css(\'opacity\', \'.25\'); $(\'#SCAbotButtonsPause img\').css(\'opacity\', \'1\'); return false;'));
        
        // button - Pause
        $('#SCAbotButtons')
            .append($('<a>')
            .attr('href', '#')
            .css('margin', '10px')
            .attr('title', scaBot.translate({'en':'Pause', 'pl':'Pauza'}))
            .attr('id', 'SCAbotButtonsPause')
            .html($('<img>')
            .css('border-radius', '32px')
            .css('background', '#fca')
            .css('opacity', '.25')
            .attr('src', 'data:image/png;base64,' +scaBot.img.pause))
            .attr('onclick', 'clearTimeout(scaBot.frameHandle); clearTimeout(scaBot.frameResume); $(this).find(\'img\').css(\'opacity\', \'.25\'); $(\'#SCAbotButtonsPlay img\').css(\'opacity\', \'1\'); return false;'));
        
        // button - Stop
        $('#SCAbotButtons')
            .append($('<a>')
            .attr('href', '#')
            .css('margin', '10px')
            .attr('title', scaBot.translate({'en':'Stop', 'pl':'Stop'}))
            .html($('<img>')
            .css('border-radius', '32px')
            .attr('src', 'data:image/png;base64,' +scaBot.img.stop))
            .attr('onclick', 'clearTimeout(scaBot.frameHandle); clearTimeout(scaBot.frameResume); $(\'#SCAbot\').remove(); return false;'));
        
        // select - Language
        $('#SCAbotButtons')
            .append($('<select>')
            .attr('id', 'SCAbotLang')
            .css('height', '32px')
            .css('border', 'none')
            .css('font-size', '20px')
            .css('vertical-align', 'middle')
            .css('margin-left', '20px')
            .css('background', 'transparent')
            .css('text-transform', 'uppercase')
            .append($('<option>').attr('value', 'en').html('en'))
            .append($('<option>').attr('value', 'pl').html('pl'))
            .attr('onchange', 'scaBot.setLang(this.value); scaBot.load();')
            .val(GM_getValue('lang', 'en')));
        
         $('#SCAbot').append($('<span>').html('Status').css({
            'margin-top': '20px',
            'display': 'block',
            'height': '30px',
             }).append($('<span>').css({'position': 'absolute', 'right': '10px'}).attr('id', 'SCAbotLevel').css('display', 'none')
             .append($('<img>').attr('src', 'data:image/png;base64,' +scaBot.img.stairs).attr('width', '24px').attr('height', '24px'))
             .append($('<span>').attr('id', 'SCAbotLevelID').css('margin-left', '5px'))
             ).append($('<img>').css({'position': 'absolute', 'left': '10px'}).attr('id', 'SCAbotBoss').css('display', 'none')
             .attr('src', 'data:image/png;base64,' +scaBot.img.boss).attr('width', '24px').attr('height', '24px')
         ));
        
         $('#SCAbot').append($('<div>').html(
             scaBot.translate({'en':
                   'Bot loaded and ready. Press <b>Play</b> to begin.<br><br>'
                  +'<b>Step</b>: Single step aka debugging mode.<br>'
                  +'<b>Play</b>: Autoplay bot aka normal mode.<br>'
                  +'<b>Pause</b>: Pause until Play clicked again.<br>'
                  +'<b>Stop</b>: Stop and remove panel. Will remain to retab to adventures. Won`t remove bot script.'
            ,'pl':
                    'Bot gotowy do gry. Naciśnij <b>Start</b> aby zacząć.<br><br>'
                  +'<b>Krok</b>: Pojedynczy krok aka tryb debugowania.<br>'
                  +'<b>Start</b>: Automatyczna gra aka tryb zwykły.<br>'
                  +'<b>Pauza</b>: Pauza do ponownego kliknięcia Graj.<br>'
                  +'<b>Stop</b>: Zatrzymanie bota i usunięcie panelu. Do przeładowania bota potrzebna będzie zmiana zakładki. Skrypt bota nie zostanie usunięty.'
            })
        ).attr('id', 'SCAbotStatus').css({
            'margin-top': '10px',
            'display': 'block',
            'height': '200px',
            'vertical-align': 'top',
            'text-align': 'left',
            'overflow': 'auto',
            'margin-right': '-10px',
            'padding-right': '10px',
            'font-family': '"StoneSans" Arial',
            'font-size': '14px',
        }));
        $('#SCAbot').append($('<span>').html(scaBot.translate({'en':'Gained rewards', 'pl':'Zdobyte nagrody'})).css({
            'margin-top': '20px',
            'display': 'block',
            'height': '30px',
        }).append($('<a>').attr('href', '#').css({'position': 'absolute', 'right': '10px', 'color': 'silver', 'display': 'none'})
        .attr('onclick', 'scaBot.removeRewardsCache(); $(\'#SCAbotLog\').html(\'\'); $(this).hide(); return false;').html('&#10003;').attr('id', 'SCAbotLogOK')));
        
        $('#SCAbot').append($('<div>').html('').attr('id', 'SCAbotLog').css({
            'margin-top': '10px',
            'display': 'block',
            'height': 'calc( 100% - 412px)',
            'vertical-align': 'top',
            'text-align': 'left',
            'overflow': 'auto',
            'margin-right': '-10px',
            'padding-right': '10px',
            'font-family': '"StoneSans" Arial',
            'font-size': '14px',
        }));
        
        scaBot.companions = undefined;
        scaBot.encounter = undefined;
        scaBot.encounterEnter = undefined;
        scaBot.encounterEnterID = undefined;
        scaBot.encounters = [];
        scaBot.party = undefined;
        scaBot.statusUpdated = false;
        scaBot.map = [];
        scaBot.boss = false;
        
        //if(GM_getValue('resume_autorun', false)){
            $('#SCAbotButtonsPlay').trigger('click');
        //}
        GM_setValue('resume_autorun', false);
        
        scaBot.level = GM_getValue('level', -1);
        if(scaBot.level === -1){
            $('#SCAbotLevel').hide();
        } else {
            $('#SCAbotLevelID').html(scaBot.level);
            $('#SCAbotLevel').show();
        }
        
        $('#SCAbotLog').html(GM_getValue('rewards', ''));
        document.getElementById('SCAbotLog').scrollTop = document.getElementById('SCAbotLog').scrollHeight;
        
        if(GM_getValue('rewards', '') !== '' && GM_getValue('rewards', '') !== undefined){
            $('#SCAbotLogOK').show();
        }
        
        if(scaBot.boss = GM_getValue('boss', false)){
            $('#SCAbotBoss').show();
        } else {
            $('#SCAbotBoss').hide();
        }
    } else {
        scaBot.loadFrames = scaBot.loadFrames +1;
        // can`t load sca since 30kms, reloading
        if(scaBot.loadFrames > 30){
            scaBot.saveAndReload();
            return;
        }
        scaBot.loadHandle = setTimeout(scaBot.load, 1000);
    }
};

// read companions
// @noparam
scaBot.readCompanions = function(){
    scaBot.companions = {};
    
    if(scaBot.debug){
        console.info('[NWO::SCA bot] .readCompanions():');
    }
    
    $('#companions li.party-entry.available:not(.promo)').each(function(companion_id, companion_el){
        var stamina = 0|$(companion_el).find('.party-stamina>span>span').html();
        var level   = 0|$(companion_el).find('.companion-rank>span:not(.comma)').html();
        var id      = $(companion_el).find('a[onclick^="client.scaAddPartyMember"]').attr('onclick').match(/'(\d+)'/)[1];
        var name    = $(companion_el).find('.party-name').html();
        var shot    = $(companion_el).find('.party-head').attr('src');
        
        var dice = {
            magic: 0,
            perception: 0,
            thievery: 0,
            combat: 0,
        };
        
        var Scrimshaw = 0;
        if(level >= 32){++Scrimshaw;}
        if(level >= 34){++Scrimshaw;}
        if(level >= 36){++Scrimshaw;}
        if(level >= 38){++Scrimshaw;}
        if(level >= 39){++Scrimshaw;}
        if(level >= 40){++Scrimshaw;}
        var Dragonling = 6 - Scrimshaw;
        
        // GDC(4, 6, 8, 10, 12) = 120
        
        dice.magic      += Dragonling * 1 * (120 / 6);
        dice.perception += Dragonling * 1 * (120 / 6);
        dice.thievery   += Dragonling * 1 * (120 / 6);
        dice.combat     += Dragonling * 6 * (120 / 6);
        
        dice.magic      += Scrimshaw  * 2 * (120 / 8);
        dice.perception += Scrimshaw  * 2 * (120 / 8);
        dice.thievery   += Scrimshaw  * 2 * (120 / 8);
        dice.combat     += Scrimshaw  * 9 * (120 / 8);
        
        $(companion_el).find('.party-dice .dice').each(function(dice_id, dice_el){
            var m_magic      = false;
            var m_perception = false;
            var m_thievery   = false;
            var m_combat     = false;
            
            // blue
            // Kossuth
            if($(dice_el).hasClass('sapphire')){
                m_magic      = true;
                m_combat     = true;
            } else
            
            // red
            // Tempus
            if($(dice_el).hasClass('ruby')){
                m_perception = true;
                m_combat     = true;
            } else
            
            // gray
            // Lolth
            if($(dice_el).hasClass('onyx')){
                m_thievery   = true;
                m_combat     = true;
            } else
            
            // purple
            // Tyr
            if($(dice_el).hasClass('amethyst')){
                m_magic      = true;
                m_perception = true;
            } else
            
            // green
            // Oghma
            if($(dice_el).hasClass('emerald')){
                m_magic      = true;
                m_thievery   = true;
            } else
            
            // yellow
            // Shar
            if($(dice_el).hasClass('topaz')){
                m_perception = true;
                m_thievery   = true;
            } else
            
            if(scaBot.debug){
                console.error('[NWO::SCA bot] .readCompanions(): Cannot read dice name.');
            }
            
            if($(dice_el).hasClass('d12')){
                dice.magic      += (m_magic      ?18 :1) * (120 / 24);
                dice.perception += (m_perception ?18 :1) * (120 / 24);
                dice.thievery   += (m_thievery   ?18 :1) * (120 / 24);
                dice.combat     += (m_combat     ?18 :1) * (120 / 24);
            } else if($(dice_el).hasClass('d10')){
                dice.magic      += (m_magic      ? 8 :0) * (120 / 10);
                dice.perception += (m_perception ? 8 :0) * (120 / 10);
                dice.thievery   += (m_thievery   ? 8 :0) * (120 / 10);
                dice.combat     += (m_combat     ? 8 :0) * (120 / 10);
            } else if($(dice_el).hasClass('d8')){
                dice.magic      += (m_magic      ? 6 :0) * (120 / 8);
                dice.perception += (m_perception ? 6 :0) * (120 / 8);
                dice.thievery   += (m_thievery   ? 6 :0) * (120 / 8);
                dice.combat     += (m_combat     ? 6 :0) * (120 / 8);
            } else if($(dice_el).hasClass('d6')){
                dice.magic      += (m_magic      ? 4 :0) * (120 / 6);
                dice.perception += (m_perception ? 4 :0) * (120 / 6);
                dice.thievery   += (m_thievery   ? 4 :0) * (120 / 6);
                dice.combat     += (m_combat     ? 4 :0) * (120 / 6);
            } else if($(dice_el).hasClass('d4')){
                dice.magic      += (m_magic      ? 2 :0) * (120 / 4);
                dice.perception += (m_perception ? 2 :0) * (120 / 4);
                dice.thievery   += (m_thievery   ? 2 :0) * (120 / 4);
                dice.combat     += (m_combat     ? 2 :0) * (120 / 4);
            } else if(scaBot.debug){
                console.error('[NWO::SCA bot] .readCompanions(): Cannot read dice shape.');
            }
        });
        
        scaBot.companions[id] = {
            'id': id,
            'level': level,
            'stamina': stamina,
            'dice': dice,
            'name': name,
            'shot': shot,
        };
        
        if(scaBot.debug){
            console.debug(scaBot.companions[id]);
        }
    });
};

// read party
// @noparam
scaBot.readParty = function(){
    scaBot.party = new Array(4);
    
    if(scaBot.debug){
        console.info('[NWO::SCA bot] .readParty():');
    }
    
    $('#content_frame_mid .party-frame .party-entry').each(function(companion_id, companion_el){
        var id      = ''+$($(companion_el).find('a')[0]).data('url-silent').match(/\d+$/g)[0];
        var name    = $(companion_el).find('a .party-name')[0].innerHTML;
        var level   = 0|$('#content #content_box #content_dungeons .party-frame .party-entry a[data-url-silent$='+id+'] .xp-bar .bar-bg-left .bar-level').html();
        var resting = ($(companion_el).hasClass('disabled')?1:0);
        
        var dice = {
            magic: 0,
            perception: 0,
            thievery: 0,
            combat: 0,
        };
        
        var Scrimshaw = 0;
        if(level >= 32){++Scrimshaw;}
        if(level >= 34){++Scrimshaw;}
        if(level >= 36){++Scrimshaw;}
        if(level >= 38){++Scrimshaw;}
        if(level >= 39){++Scrimshaw;}
        if(level >= 40){++Scrimshaw;}
        var Dragonling = 6 - Scrimshaw;
        
        // NWW(4, 6, 8, 10, 12) = 120
        
        dice.magic      += Dragonling * 1 * (120 / 6);
        dice.perception += Dragonling * 1 * (120 / 6);
        dice.thievery   += Dragonling * 1 * (120 / 6);
        dice.combat     += Dragonling * 6 * (120 / 6);
        
        dice.magic      += Scrimshaw  * 2 * (120 / 8);
        dice.perception += Scrimshaw  * 2 * (120 / 8);
        dice.thievery   += Scrimshaw  * 2 * (120 / 8);
        dice.combat     += Scrimshaw  * 9 * (120 / 8);
        
        $(companion_el).find('.party-dice>.dice').each(function(dice_id, dice_el){
            var m_magic      = false;
            var m_perception = false;
            var m_thievery   = false;
            var m_combat     = false;
            
            // blue
            // Kossuth
            if($(dice_el).hasClass('sapphire')){
                m_magic      = true;
                m_combat     = true;
            } else
            
            // red
            // Tempus
            if($(dice_el).hasClass('ruby')){
                m_perception = true;
                m_combat     = true;
            } else
            
            // gray
            // Lolth
            if($(dice_el).hasClass('onyx')){
                m_thievery   = true;
                m_combat     = true;
            } else
            
            // purple
            // Tyr
            if($(dice_el).hasClass('amethyst')){
                m_magic      = true;
                m_perception = true;
            } else
            
            // green
            // Oghma
            if($(dice_el).hasClass('emerald')){
                m_magic      = true;
                m_thievery   = true;
            } else
            
            // yellow
            // Shar
            if($(dice_el).hasClass('topaz')){
                m_perception = true;
                m_thievery   = true;
            } else
            if(scaBot.debug){
                console.error('[NWO::SCA bot] .readParty(): Cannot read dice name.');
            }
            
            if($(dice_el).hasClass('d12')){
                dice.magic      += (m_magic      ?18 :1) * (120 / 24);
                dice.perception += (m_perception ?18 :1) * (120 / 24);
                dice.thievery   += (m_thievery   ?18 :1) * (120 / 24);
                dice.combat     += (m_combat     ?18 :1) * (120 / 24);
            } else if($(dice_el).hasClass('d10')){
                dice.magic      += (m_magic      ? 8 :0) * (120 / 10);
                dice.perception += (m_perception ? 8 :0) * (120 / 10);
                dice.thievery   += (m_thievery   ? 8 :0) * (120 / 10);
                dice.combat     += (m_combat     ? 8 :0) * (120 / 10);
            } else if($(dice_el).hasClass('d8')){
                dice.magic      += (m_magic      ? 6 :0) * (120 / 8);
                dice.perception += (m_perception ? 6 :0) * (120 / 8);
                dice.thievery   += (m_thievery   ? 6 :0) * (120 / 8);
                dice.combat     += (m_combat     ? 6 :0) * (120 / 8);
            } else if($(dice_el).hasClass('d6')){
                dice.magic      += (m_magic      ? 4 :0) * (120 / 6);
                dice.perception += (m_perception ? 4 :0) * (120 / 6);
                dice.thievery   += (m_thievery   ? 4 :0) * (120 / 6);
                dice.combat     += (m_combat     ? 4 :0) * (120 / 6);
            } else if($(dice_el).hasClass('d4')){
                dice.magic      += (m_magic      ? 2 :0) * (120 / 4);
                dice.perception += (m_perception ? 2 :0) * (120 / 4);
                dice.thievery   += (m_thievery   ? 2 :0) * (120 / 4);
                dice.combat     += (m_combat     ? 2 :0) * (120 / 4);
            } else if(scaBot.debug){
                console.error('[NWO::SCA bot] .readParty(): Cannot read dice shape.');
            }
        });
        
        scaBot.party[id] = {
            'id': id,
            'dice': dice,
            'name': name,
            'level': level,
            'resting': resting,
        };
        
        if(scaBot.debug){
            console.debug(scaBot.party[id]);
        }
    });
};

// read map
/*
    @noparam
    @noreturn
*/
scaBot.readMap = function(){
    scaBot.map = [];
    
    if(scaBot.level === -1 && $('#content_box #content_login #content_dungeons .explore-map .dungeon-map .tile div[data-encounter-id].stairs-up').length === 0){
        scaBot.level = 1;
        $('#SCAbotLevelID').html(scaBot.level);
        $('#SCAbotLevel').show();
    }
    
    $('#content_box #content_login #content_dungeons .explore-map .dungeon-map .tile div[data-encounter-id]:not(.complete)').each(function(){
        /*
            0 - normal encounter
            1 - downstairs
            2 - upstairs
            3 - treasure
            4 - boss
        */
        
        var type = 0;
        var id = ''+$(this).attr('data-encounter-id');
        
        if($(this).hasClass('stairs-down')){
            type = 1;
        }
        
        if($(this).hasClass('stairs-up')){
            type = 2;
        }
        
        if($(this).hasClass('treasure')){
            type = 3;
        }
        
        if($(this).hasClass('boss')){
            type = 4;
        }
        
        scaBot.map[id] = {'id': id, 'type': type};
    });
    
    return;
};

// select party for dungeon
// @noparam
scaBot.dungeonSelectParty = function(){
    scaBot.readCompanions();
    
    var requiredStamina = 0|$('.page-dungeon-chooseparty .chooseparty-stamina span span.number').html();
    var companions = $.map(jQuery.extend(true, {}, scaBot.companions), function(value, index){return [value];});
    var team = [];
    
    // remove companions with not enough stamina and level < 30
    $.each(companions, function(companion, value){
        if(companions.hasOwnProperty(companion)){
            if(companions[companion].stamina < requiredStamina || companions[companion].level < 30){
                delete companions[companion];
            }
        }
    });
    
    companions.sort(function(a, b){return (a.level === b.level ? b.dice.magic - a.dice.magic : b.level - a.level);});
    var b = true;
    $.each(companions, function(companion, value){
        if(companions.hasOwnProperty(companion)){
            if(b){
                team[0] = companions[companion].id;
                delete companions[companion];
                b = false;
            }
        }
    });
    
    companions.sort(function(a, b){return (a.level === b.level ? b.dice.perception - a.dice.perception : b.level - a.level);});
    b = true;
    $.each(companions, function(companion, value){
        if(companions.hasOwnProperty(companion)){
            if(b){
                team[1] = companions[companion].id;
                delete companions[companion];
                b = false;
            }
        }
    });
    
    companions.sort(function(a, b){return (a.level === b.level ? b.dice.thievery - a.dice.thievery : b.level - a.level);});
    b = true;
    $.each(companions, function(companion, value){
        if(companions.hasOwnProperty(companion)){
            if(b){
                team[2] = companions[companion].id;
                delete companions[companion];
                b = false;
            }
        }
    });
    
    companions.sort(function(a, b){return (a.level === b.level ? b.dice.combat - a.dice.combat : b.level - a.level);});
    b = true;
    $.each(companions, function(companion, value){
        if(companions.hasOwnProperty(companion)){
            if(b){
                team[3] = companions[companion].id;
                delete companions[companion];
                b = false;
            }
        }
    });
    
    $team = $('<table>').css({'margin-top': '10px', 'margin-bottom': '10px'});
    var i;
    for(i=0; i<4; ++i){
        $team.append($('<tr>')
            .append($('<td>').css('padding', '0').html($('<img>').attr('src', scaBot.companions[team[i]].shot).attr({'width': '32px', 'height': '32px'}).attr('title', scaBot.companions[team[i]].name)))
            .append($('<td>').css('padding-left', '10px').html($('<span title="magic" class="faq-rune magic"></span>')
                .css({'-webkit-filter': 'invert(1) brightness(5)', 'filter': 'invert(1) brightness(5)', 'width': '16px', 'height': '16px', 'zoom': 'calc(16 / 20)', 'top': '0'})))
            .append($('<td>').css({'padding-left': '5px', 'text-align': 'right'}).append($('<span>').html((scaBot.companions[team[i]].dice.magic      /120).toFixed(2))))
            .append($('<td>').css('padding-left', '10px').html($('<span title="perception" class="faq-rune perception"></span>')
                .css({'-webkit-filter': 'invert(1) brightness(5)', 'filter': 'invert(1) brightness(5)', 'width': '16px', 'height': '16px', 'zoom': 'calc(16 / 20)', 'top': '0'})))
            .append($('<td>').css({'padding-left': '5px', 'text-align': 'right'}).append($('<span>').html((scaBot.companions[team[i]].dice.perception /120).toFixed(2))))
            .append($('<td>').css('padding-left', '10px').html($('<span title="thievery" class="faq-rune thievery"></span>')
                .css({'-webkit-filter': 'invert(1) brightness(5)', 'filter': 'invert(1) brightness(5)', 'width': '16px', 'height': '16px', 'zoom': 'calc(16 / 20)', 'top': '0'})))
            .append($('<td>').css({'padding-left': '5px', 'text-align': 'right'}).append($('<span>').html((scaBot.companions[team[i]].dice.thievery   /120).toFixed(2))))
            .append($('<td>').css('padding-left', '10px').html($('<span title="combat" class="faq-rune combat"></span>')
                .css({'-webkit-filter': 'invert(1) brightness(5)', 'filter': 'invert(1) brightness(5)', 'width': '16px', 'height': '16px', 'zoom': 'calc(16 / 20)', 'top': '0'})))
            .append($('<td>').css({'padding-left': '5px', 'text-align': 'right'}).append($('<span>').html((scaBot.companions[team[i]].dice.combat     /120 /3).toFixed(2))))
        );
    }
    
    scaBot.status($team, true);
    scaBot.party = team;
    
    for(i=0; i<4; ++i){
        client.scaAddPartyMember(scaBot.companions[team[i]].id);
    }
    
    if(scaBot.debug){
        console.info('[NWO::SCA bot] .dungeonSelectParty():');
        for(i=0; i<4; ++i){
            console.debug(scaBot.companions[team[i]]);
        }
    }
};

/*
	read encounter
    
    scaBot.encounter › object of 4 dice powers with assigned number of summary points to win encounter:
    	magic, perception, thievery, combat
*/
// @noparam
scaBot.readEncounter = function(){
    scaBot.encounters[scaBot.encounter] = {
        magic: 0,
        perception: 0,
        thievery: 0,
        combat: 0,
        id: scaBot.encounter,
    };
    
    $('#modal .modal-window .dungeon-encounter .challenge-trials .trial .rune').each(function(rune_id, rune_el){
        var num = 0|$(rune_el).find('.num')[0].innerHTML;
        if(num <= 0){
            console.error(
                '[NWO::SCA bot] .readEncounter(): Rune #%i has no trial.',
                rune_id
            );
        }
        
        if($(rune_el).hasClass('magic')){
            scaBot.encounters[scaBot.encounter].magic += num;
        } else
        if($(rune_el).hasClass('perception')){
            scaBot.encounters[scaBot.encounter].perception += num;
        } else
        if($(rune_el).hasClass('thievery')){
            scaBot.encounters[scaBot.encounter].thievery += num;
        } else
        if($(rune_el).hasClass('combat')){
            scaBot.encounters[scaBot.encounter].combat += num;
        } else
        if(scaBot.debug){
            console.error('[NWO::SCA bot] .readEncounter(): Cannot read rune powers.');
        }
	});
    
    $('#modal .modal-window .dungeon-encounter .challenge-trials .trial').each(function(rune_id, rune_el){
        var rune = $(rune_el).clone();
        rune.css({'position': 'static', 'zoom': '0.5', 'display': 'inline-block', 'margin-top': '10px', 'margin-bottom': '10px'}).find('.num').each(function(){$(this).css('zoom', '1.75');});
        scaBot.status(rune, true);
    });
    
    // leave red encounter
    client.scaConfirmEncounter();
    
    var _id = scaBot.encounter;
    scaBot.encounter = undefined;
    
    if(scaBot.debug){
        console.info('[NWO::SCA bot] .readEncounter():');
        console.debug(scaBot.encounters[_id]);
    }
};

// determine encounter to go
// @noparam
scaBot.determineEncounter = function(){
    scaBot.readParty();
    
    if(scaBot.debug){
        console.info('[NWO::SCA bot] .determineEncounter():');
    }
    
    // least dice values of all party companions
    var dice = {
        magic: null,
        perception: null,
        thievery: null,
        combat: null,
    };
    
    for(var companion in scaBot.party){
        dice.magic      = (dice.magic      === null ? scaBot.party[companion].dice.magic      : Math.min(dice.magic,      scaBot.party[companion].dice.magic));
        dice.perception = (dice.perception === null ? scaBot.party[companion].dice.perception : Math.min(dice.perception, scaBot.party[companion].dice.perception));
        dice.thievery   = (dice.thievery   === null ? scaBot.party[companion].dice.thievery   : Math.min(dice.thievery,   scaBot.party[companion].dice.thievery));
        dice.combat     = (dice.combat     === null ? scaBot.party[companion].dice.combat     : Math.min(dice.combat,     scaBot.party[companion].dice.combat));
    }
    
    console.debug(scaBot.map);
    
    var encounters = [];
    var id = 0;
    for(var encounter in scaBot.map){
        var chance = 0;
        if(scaBot.map[encounter].type == 0 || scaBot.map[encounter].type == 3 || scaBot.map[encounter].type == 4){
            chance =                  dice.magic      / scaBot.encounters[encounter].magic;
            chance = Math.min(chance, dice.perception / scaBot.encounters[encounter].perception);
            chance = Math.min(chance, dice.thievery   / scaBot.encounters[encounter].thievery);
            chance = Math.min(chance, dice.combat     / scaBot.encounters[encounter].combat);
            
            if(scaBot.debug){
                console.debug({'encounter.id': scaBot.map[encounter].id, 'chance': chance.toFixed(2)});
            }
        }
        
        encounters[id++] = {'id': scaBot.map[encounter].id, 'type': scaBot.map[encounter].type, 'chance': chance};
    }
    
    var hp = 0|$('#content_box #content_login #content_dungeons .dungeon-health-bar .bar-filled.health-now').attr('style').match(/width: (\d+(?:\.\d+)?)%;/)[1];
    
    // boss
    if(!scaBot.boss && $('#content_box #content_login #content_dungeons .explore-map .dungeon-map .tile div[data-encounter-id].boss').length !== 0){
        $('#SCAbotBoss').show();
        
        if(hp >= 50){
            scaBot.boss = true;
        }
    }
    
    encounters.sort(function(a, b){
        // chests first
        if(a.type === 3 && b.type !== 3)return -1;
        if(a.type !== 3 && b.type === 3)return 1;
        
        // boss mode
        /*
        if(scaBot.boss && hp >= 50 && $('#content_box #content_login #content_dungeons .explore-map .dungeon-map .tile div[data-encounter-id]:not(.complete):not(.stairs-up):not(.stairs-down):not(.boss)').length !== 0){
            // avoid boss
            if(a.type == 4)return 1;
            if(b.type == 4)return -1;
            
            // go up
            if(a.type == 2)return -1;
            if(b.type == 2)return 1;
        }
        
        // no boss mode
        if(!scaBot.boss || hp < 50 || $('#content_box #content_login #content_dungeons .explore-map .dungeon-map .tile div[data-encounter-id]:not(.complete):not(.stairs-up):not(.stairs-down):not(.boss)').length === 0){
        */
            // go boss
            if(a.type == 4)return -1;
            if(b.type == 4)return 1;
            
            // go down
            if(a.type == 1)return -1;
            if(b.type == 1)return 1;
        //}
        
        // higher chance first
        if(a.chance > b.chance)return -1;
        if(a.chance < b.chance)return 1;
        
        // higher id first
        return b.id - a.id;
    });
    
    for(var encounter in encounters){
        encounters[0] = encounters[encounter];
        break;
    }
    
    scaBot.encounterEnter = encounters[0].id;
    $('#content_box #content_login #content_dungeons .explore-map .dungeon-map [data-encounter-id="' +encounters[0].id +'"]').trigger('click');
    
    switch(encounters[0].type){
        case 4:{
            scaBot.status(scaBot.translate({'en':'<b>Found Boss</b>. Going fight the Boss.', 'pl':'<b>Znaleziono Bossa</b>. Zmierzam walczyć z Bossem.'}));
            
            if(scaBot.debug){
                console.log('[NWO::SCA bot] .determineEncounter(): Go fight Boss.');
            }
            
            break;
        }

        case 3:{
            scaBot.status(scaBot.translate({'en':'<b>Found Treasure</b>. Going fight for the reward.', 'pl':'<b>Znaleziono Skarb</b>. Zmierzam walczyć po nagrodę.'}));
            
            if(scaBot.debug){
                console.log('[NWO::SCA bot] .determineEncounter(): Go fight for Treasure.');
            }
            
            break;
        }

        case 2:{
            scaBot.status(scaBot.translate({'en':'<b>Found Upstairs</b>. Going backwards the goal, searching treasures.', 'pl':'<b>Znaleziono schody w górę</b>. Oddalam się od celu w poszukiwaniu skarbów.'}));
            
            if(scaBot.debug){
                console.log('[NWO::SCA bot] .determineEncounter(): Go upstairs.');
            }
            
            scaBot.encounter = undefined;
            scaBot.encounters = [];
            scaBot.map = [];
            
            scaBot.level = scaBot.level - 1;
            $('#SCAbotLevelID').html(scaBot.level);
            $('#SCAbotLevel').show();
            
            break;
        }

        case 1:{
            scaBot.status(scaBot.translate({'en':'<b>Found Downstairs</b>. Going towards the goal.', 'pl':'<b>Znaleziono schody na dół</b>. Zmierzam w stronę celu.'}));
            
            if(scaBot.debug){
                console.log('[NWO::SCA bot] .determineEncounter(): Go downstairs.');
            }
            
            scaBot.level = scaBot.level + 1;
            $('#SCAbotLevelID').html(scaBot.level);
            $('#SCAbotLevel').show();
            
            scaBot.encounter = undefined;
            scaBot.encounters = [];
            scaBot.map = [];
            
            break;
        }
        case 0:{
            scaBot.status(scaBot.translate({
                'en': 'Choosing encounter #' +encounters[0].id +'.<br>Success chance: <b>' + encounters[0].chance.toFixed(2) + '%</b> .',
                'pl': 'Wybieranie potyczki #' +encounters[0].id +'<br>Szansa na sukces: <b>' + encounters[0].chance.toFixed(2) + '%</b>.',
            }), true);
            
            if(scaBot.debug){
                console.info('[NWO::SCA bot] .determineEncounter(): Choosing encounter #' +encounters[0].id +' with a chance of ' + encounters[0].chance.toFixed(2) + '%.');
            }
        }
    }
};

// determine encounter to go
// @noparam
scaBot.encounterSelectParty = function(){
    //scaBot.readEncounter();
    scaBot.readParty();
    
    if(scaBot.debug){
        console.info('[NWO::SCA bot] .encounterSelectParty():');
        console.log(scaBot.party);
    }
    
    var bestCompanionID = null;
    var bestCompanionChance = null;
    var chance = null;
    var chanceP = null;
    for(var companion in scaBot.party){
        if(scaBot.party[companion].resting !== 1){
            chance =                  (scaBot.party[companion].dice.magic      / 120) / scaBot.encounters[scaBot.encounterEnterID].magic;
            chance = Math.min(chance, (scaBot.party[companion].dice.perception / 120) / scaBot.encounters[scaBot.encounterEnterID].perception);
            chance = Math.min(chance, (scaBot.party[companion].dice.thievery   / 120) / scaBot.encounters[scaBot.encounterEnterID].thievery);
            chance = Math.min(chance, (scaBot.party[companion].dice.combat     / 120) / scaBot.encounters[scaBot.encounterEnterID].combat);

            if(bestCompanionID === null || chance > bestCompanionChance){
                bestCompanionChance = chance;
                bestCompanionID = ''+scaBot.party[companion].id;
            }

            chanceP = chance / (chance + 1);

            if(scaBot.debug){
                console.debug({'id': scaBot.party[companion].id, 'chance': (chanceP * 100).toFixed(2) + '%', 'name': scaBot.party[companion].name, 'resting': scaBot.party[companion].resting});
            }
        }
    }
    
    chanceP = bestCompanionChance / (bestCompanionChance + 1);
    
    $('#modal .modal-content .encounter-party-list .party-entry a.selectable').each(function(){
        var id = ''+$(this).attr('onclick').match(/^client\.scaConfirmEncounter\(\'(\d+)\'/)[1];
        if(id == scaBot.party[bestCompanionID].id){
            var shot = $(this).find('.party-head').attr('src');
            
            $team = $('<table>').css({'margin-top': '10px', 'margin-bottom': '10px'});
            $team.append($('<tr>')
                .append($('<td>').css('padding', '0').html($('<img>').attr('src', shot).attr({'width': '32px', 'height': '32px'})))
                .append($('<td>').css('padding-left', '10px').html(scaBot.translate({
                    'en':'Choosing companion <b>' + scaBot.party[bestCompanionID].name + '</b>.<br>Success chance: <b>' + (chanceP * 100).toFixed(2)  + '%</b>.',
                    'pl':'Wybieranie towarzysza <b>' + scaBot.party[bestCompanionID].name + '</b>.<br>Szansa na zwycięstwo: <b>' + (chanceP * 100).toFixed(2)  + '%</b>.',
                })))
            );
            
            scaBot.status($team);
            client.scaConfirmEncounter(''+scaBot.party[bestCompanionID].id);
        }
    });
    
    if(scaBot.debug){
        console.info('[NWO::SCA bot] .encounterSelectParty(): Choosing companion ' + scaBot.party[bestCompanionID].name + ' with a chance of ' + (chanceP * 100).toFixed(2) + '%.');
    }
};

 // select die in encounter
// @noparam
scaBot.encounterSelectDie = function(){
    // animation active
    if(!$('.dice-rolls>span>a').length || !$('.challenge-container .challenge-trials .trial.active .rune').length){
        return;
    }
    
    // trial dices
    var trial_active = {
        magic: 0,
        perception: 0,
        thievery: 0,
        combat: 0,
    };
    
    // read active die in current trial
    $('.challenge-container .challenge-trials .trial.active .rune').each(function(rune_id, rune_el){
        var num = 0|$(rune_el).find('.num')[0].innerHTML;
        
        if($(rune_el).hasClass('magic')){
            trial_active.magic += num;
        } else
        if($(rune_el).hasClass('perception')){
            trial_active.perception += num;
        } else
        if($(rune_el).hasClass('thievery')){
            trial_active.thievery += num;
        } else
        if($(rune_el).hasClass('combat')){
            trial_active.combat += num;
        } else
        if(scaBot.debug){
            console.error('[NWO::SCA bot] .encounterSelectDie(): Cannot read rune powers.');
        }
	});
    
    // trial dices
    var trial = {
        magic: 0,
        perception: 0,
        thievery: 0,
        combat: 0,
    };
    
    // read die in current trial
    $('.challenge-container .challenge-trials .trial .rune').each(function(rune_id, rune_el){
        var num = 0|$(rune_el).find('.num')[0].innerHTML;
        
        if($(rune_el).hasClass('magic')){
            trial.magic += num;
        } else
        if($(rune_el).hasClass('perception')){
            trial.perception += num;
        } else
        if($(rune_el).hasClass('thievery')){
            trial.thievery += num;
        } else
        if($(rune_el).hasClass('combat')){
            trial.combat += num;
        } else
        if(scaBot.debug){
            console.error('[NWO::SCA bot] .encounterSelectDie(): Cannot read rune powers.');
        }
	});
    
    if(scaBot.debug){
        console.info('[NWO::SCA bot] .encounterSelectDie(): trials:');
        console.debug(trial);
    }
    
    // todo
    var todo_active = 3* trial_active.magic + 3* trial_active.perception + 3* trial_active.thievery + trial_active.combat;
    var todo        = 3* trial.magic        + 3* trial.perception        + 3* trial.thievery        + trial.combat;
    
    // trial dices
    var dies = [];
    var diesLeft = $('.dice-rolls>span>a:not(.used)').length;
    var progress = 0;
    
    ////////// case: discard one die
    if($('.dice-rolls>span>a.discardable').length){
        var dieDiscardColor = -1;
        $('.dice-rolls>span>a.discardable').each(function(){
            var id = $(this).attr('class').match(/slot\-(\d)/)[1];
            var loose = 0;
            
            if(id >= 6){
                var m_magic      = 1;
                var m_perception = 1;
                var m_thievery   = 1;
                var m_combat     = 1;
                
                // blue
                // Kossuth
                if($(this).hasClass('sapphire')){
                    m_magic      = 2;
                    m_combat     = 2;
                } else
                
                // red
                // Tempus
                if($(this).hasClass('ruby')){
                    m_perception = 2;
                    m_combat     = 2;
                } else
                
                // gray
                // Lolth
                if($(this).hasClass('onyx')){
                    m_thievery   = 2;
                    m_combat     = 2;
                } else
                
                // purple
                // Tyr
                if($(this).hasClass('amethyst')){
                    m_magic      = 2;
                    m_perception = 2;
                } else
                
                // green
                // Oghma
                if($(this).hasClass('emerald')){
                    m_magic      = 2;
                    m_thievery   = 2;
                } else
                
                // yellow
                // Shar
                if($(this).hasClass('topaz')){
                    m_perception = 2;
                    m_thievery   = 2;
                }
                
                loose += 3 * (m_magic      / trial.magic);
                loose += 3 * (m_perception / trial.perception);
                loose += 3 * (m_thievery   / trial.thievery);
                loose +=      m_combat     / trial.combat;
                
                if(m_combat === 1){
                    dieDiscardColor = (dieDiscardColor === -1 ? (id < dieDiscardColor ? id : dieDiscardColor) : id);
                }
            }
            
            dies[id] = {'id': id, 'loose': loose};
        });
        
        dies.sort(function(a, b){return a.loose - b.loose === 0 ? a.loose - b.loose : a.id - b.id;});
        
        if(todo === todo_active && todo.magic === 0 && todo.perception === 0 && todo.thievery === 0 && todo.combat < 3 && dieDiscardColor !== -1){
            scaBot.status(scaBot.translate({
                'en': 'Sacrify color die #<b>' +dies[dieDiscardColor].id +'</b>.',
                'pl': 'Poświęć kolorową kość #<b>' +dies[dieDiscardColor].id +'</b>.',
            }), true);
            scaBot.status($('.dice-rolls>span>a.discardable.slot-' +dies[dieDiscardColor].id).clone().css({'margin-top': '10px', 'margin-bottom': '10px'}), true);

            client.scaChooseDie(dies[dieDiscardColor].id);

            if(scaBot.debug){
                console.info('[NWO::SCA bot] .encounterSelectDie(): Sacrify color die #' +dies[dieDiscardColor].id +'.');
            }
            return;
        }
        
        scaBot.status(scaBot.translate({
            'en': 'Discard die #<b>' +dies[0].id +'</b>.',
            'pl': 'Zniszcz kość #<b>' +dies[0].id +'</b>.',
        }), true);
        scaBot.status($('.dice-rolls>span>a.discardable.slot-' +dies[0].id).clone().css({'margin-top': '10px', 'margin-bottom': '10px'}), true);
        
        client.scaChooseDie(dies[0].id);

        if(scaBot.debug){
            console.info('[NWO::SCA bot] .encounterSelectDie(): Discard die #' +dies[0].id +'.');
        }
        return;
    }
    ////////// /case: discard one die
    
    if(scaBot.debug){
        console.info('[NWO::SCA bot] .encounterSelectDie(): dies:');
    }
    
    var dieWhite = -1;
    
    // read trial dices
    $('.dice-rolls>span>a.usable').each(function(){
        var num = 1;
        var max = 0;
        var die = {
            magic: 0,
            perception: 0,
            thievery: 0,
            combat: 0,
            wild: -1,
            power: 0,
        };
        
        var id = $(this).attr('class').match(/slot\-(\d)/)[1];
        
        if($(this).find('span>.num')){
            num = 0|$(this).find('span>.num').html() || 1;
        }
        
        var m_magic      = 1;
        var m_perception = 1;
        var m_thievery   = 1;
        var m_combat     = 1;
        
        // blue
        // Kossuth
        if($(this).hasClass('sapphire')){
            m_magic      = 2;
            m_combat     = 2;
        } else
        
        // red
        // Tempus
        if($(this).hasClass('ruby')){
            m_perception = 2;
            m_combat     = 2;
        } else
        
        // gray
        // Lolth
        if($(this).hasClass('onyx')){
            m_thievery   = 2;
            m_combat     = 2;
        } else
        
        // purple
        // Tyr
        if($(this).hasClass('amethyst')){
            m_magic      = 2;
            m_perception = 2;
        } else
        
        // green
        // Oghma
        if($(this).hasClass('emerald')){
            m_magic      = 2;
            m_thievery   = 2;
        } else
        
        // yellow
        // Shar
        if($(this).hasClass('topaz')){
            m_perception = 2;
            m_thievery   = 2;
        }
        
        progress = 0;
        if($(this).hasClass('wild')){
            max = Math.min(3* m_magic, 3* trial_active.magic);
            var _new = 0;
            die.wild = 0;
            
            _new = Math.min(3* m_perception, 3* trial_active.perception);
            if(_new > max){
                max = _new;
                die.wild = 1;
            }
            
            _new = Math.min(3* m_thievery, 3* trial_active.thievery);
            if(_new > max){
                max = _new;
                die.wild = 2;
            }
            
            _new = Math.min(3* m_combat, trial_active.combat);
            if(_new > max){
                max = _new;
                die.wild = 3;
            }
            
            progress = max;
        } else
        if($(this).hasClass('magic-combat')){
            die.magic += num;
            die.combat += 3* num;
        } else
        if($(this).hasClass('perception-combat')){
            die.perception += num;
            die.combat += 3* num;
        } else
        if($(this).hasClass('thievery-combat')){
            die.thievery += num;
            die.combat += 3* num;
        } else
        if($(this).hasClass('magic-perception')){
            die.magic += num;
            die.perception += num;
        } else
        if($(this).hasClass('magic-thievery')){
            die.magic += num;
            die.thievery += num;
        } else
        if($(this).hasClass('perception-thievery')){
            die.perception += num;
            die.thievery += num;
        } else
        if($(this).hasClass('magic')){
            die.magic += num;
        } else
        if($(this).hasClass('perception')){
            die.perception += num;
        } else
        if($(this).hasClass('thievery')){
            die.thievery += num;
        } else
        if($(this).hasClass('combat')){
            die.combat += num;
        } else
        if(scaBot.debug){
            console.error('[NWO::SCA bot] .encounterSelectDie(): Cannot read dice powers.');
        }
        
        if($(this).hasClass('d6')){
            die.power = 3;
        } else {
            die.power = 6;
        }
        
        if(scaBot.debug){
            console.debug(die);
        }
        
        progress += Math.min(3* die.magic,      3* trial_active.magic);
        progress += Math.min(3* die.perception, 3* trial_active.perception);
        progress += Math.min(3* die.thievery,   3* trial_active.thievery);
        progress += Math.min(   die.combat,        trial_active.combat);
        
        max = false;
        if(
                  (trial_active.magic      > 0 && trial_active.magic      - die.magic      <= 0)
            ||    (trial_active.perception > 0 && trial_active.perception - die.perception <= 0)
            ||    (trial_active.thievery   > 0 && trial_active.thievery   - die.thievery   <= 0)
            ||    (trial_active.combat     > 0 && trial_active.combat     - die.combat     <= 0)
        ){
            max = true;
        }
        
        if($(this).hasClass('d6')){
            die.power = Math.max(
                Math.min(3, 3* trial_active.magic),
                Math.min(3, 3* trial_active.perception),
                Math.min(3, 3* trial_active.thievery),
                Math.min(3, trial_active.combat)
            );
        } else
        if(id < 6 && $(this).hasClass('d8')){
            die.power = Math.max(
                Math.min(3, 3* trial_active.magic)    + Math.min(3, 3* trial_active.perception),
                Math.min(3, 3* trial_active.thievery) + Math.min(3, trial_active.combat)
            );
        }
        if(id >= 6){
             die.power = Math.max(
                Math.min(3 * m_magic,            3* trial_active.magic),
                Math.min(3 * m_perception,       3* trial_active.perception),
                Math.min(3 * m_thievery,         3* trial_active.thievery),
                Math.min(3 * m_combat,              trial_active.combat),
                Math.min(3 * (m_magic      - 1), 3* trial_active.magic)+
                Math.min(3 * (m_perception - 1), 3* trial_active.perception)+
                Math.min(3 * (m_thievery   - 1), 3* trial_active.thievery)+
                Math.min(3 * (m_combat     - 1),    trial_active.combat)
            );
        }
        
        if(id < 6){
            dieWhite = (dieWhite === -1 ? (id < dieWhite ? id : dieWhite) : id);
        }
        
        if(die.wild !== -1){
            die.power = 6;
        }
        
        dies[id] = {'id': id, 'progress': progress, 'wild': die.wild, 'power': die.power, 'max': max};
    });
    
    dies.sort(function(a, b){return (b.progress - a.progress === 0 ? a.id - b.id : b.progress - a.progress);});
    
    var die;
    if(scaBot.debug){
        console.info('[NWO::SCA bot] .encounterSelectDie(): progress:');
        for(die in dies){
            console.debug(dies[die]);
        }
    }
    
    // last trial
    // simulate "roll all"
    if(todo === todo_active){
        for(die in dies){
            trial.magic -= dies[die].magic;
            trial.perception -= dies[die].perception;
            trial.thievery -= dies[die].thievery;
            trial.combat -= dies[die].combat;
        }
    }
    
    var rollall = false;
    if(trial.magic <= 0 && trial.perception <= 0 && trial.thievery <= 0 && trial.combat <= 0){
        rollall = true;
    }
    
    for(die in dies){
        if(dieWhite !== -1 && $('.dice-tray .party-entry button[disabled]').length && dies[die].id >= 6 && (dies[die].progress / dies[die].power) < (diesLeft / 10)){
            // sacrify white die
            console.info('[NWO::SCA bot] .encounterSelectDie(): Safrify white die #' + dies[dieWhite].id);
            client.scaChooseDie(dies[dieWhite].id);
            
            scaBot.status(scaBot.translate({
                'en': 'Sacrify white die #<b>' +dies[dieWhite].id +'</b>.',
                'pl': 'Poświęć białą kość #<b>' +dies[dieWhite].id +'</b>.',
            }), true);
            scaBot.status($('.dice-rolls>span>a.usable.slot-' +dies[dieWhite].id).clone().css({'margin-top': '10px', 'margin-bottom': '10px'}), true);
            
            break;
        }
        
        if($('.dice-tray .party-entry button[disabled]').length || rollall || dies[die].max || (dies[die].progress / dies[die].power) >= (diesLeft / 10)){
            if(dies[die].wild != -1){
                console.info('[NWO::SCA bot] .encounterSelectDie(): Choose die #' + dies[die].id +' wild #' +dies[die].wild);
                client.scaChooseDieWild(dies[die].id, dies[die].wild);
                
                scaBot.status(scaBot.translate({
                    'en': 'Choose die #<b>' +dies[die].id +'</b>.',
                    'pl': 'Wybierz kość #<b>' +dies[die].id +'</b>.',
                }), true);
                scaBot.status($('.dice-rolls>span>a.usable.slot-' +dies[die].id).clone().css({'margin-top': '10px', 'margin-bottom': '10px'}), true);
                
                break;
            } else {
                console.info('[NWO::SCA bot] .encounterSelectDie(): Choose die #' + dies[die].id);
                client.scaChooseDie(dies[die].id);
                
                scaBot.status(scaBot.translate({
                    'en': 'Choose die #<b>' +dies[die].id +'</b>.',
                    'pl': 'Wybierz kość #<b>' +dies[die].id +'</b>.',
                }), true);
                scaBot.status($('.dice-rolls>span>a.usable.slot-' +dies[die].id).clone().css({'margin-top': '10px', 'margin-bottom': '10px'}), true);
                
                break;
            }
        } else {
            console.info('[NWO::SCA bot] .encounterSelectDie(): Choose to reroll');
            client.scaRollDice();
            
            scaBot.status(scaBot.translate({
                'en': 'Choose die #<b>' +dies[die].id +'</b>.',
                'pl': 'Wybierz kość #<b>' +dies[die].id +'</b>.',
            }), true);
            scaBot.status($('.dice-rolls>span>a.usable.slot-' +dies[die].id).clone().css({'margin-top': '10px', 'margin-bottom': '10px'}), true);
            
            break;
        }
        
        break;
    }
};

// 4. think
/*
    main thinking function. called from HTML div panel or from console.
    determine what to do and do it (delayed!)
*/
// @noparam
scaBot.think = function(){
    // daily reward
    if($('#modal .modal-window.daily-dice').length){
        if($('#modal .modal-window.daily-dice button[onclick="client.scaRollDaily();"]').is(':visible')){
            $('#modal .modal-window.daily-dice button[onclick="client.scaRollDaily();"]').trigger('click');
            
            scaBot.status(scaBot.translate({'en':'Roll daily reward.', 'pl':'Losowanie dziennych nagród.'}));
            if(scaBot.debug){
                console.log('[NWO::SCA bot] .think(): Daily reward: Roll.');
            }
            
            return;
        }
        
        if($('#modal .modal-window.daily-dice button[onclick="client.scaCheckDailies();"]').is(':visible')){
            // status and log reward
            $reward = $('#modal .modal-window.daily-dice .combat-rewards .reward').clone();
            $reward.find('.inner H4').css('color', 'black');
            
            scaBot.status(scaBot.translate({
                'en': 'Rolled <b>' +$('#modal .modal-window.daily-dice .daily-dice-result-block h3 span').html() +'</b>. Reward:<br>',
                'pl': 'Wylosowano <b>' +$('#modal .modal-window.daily-dice .daily-dice-result-block h3 span').html() +'</b>. Nagroda:<br>',
            }), true);
            scaBot.status($reward, true);
            
            /*scaBot.log(scaBot.translate({
                'en': '<b>' +$('.name-char').html() +'</b> rolled <b>' +$('#modal .modal-window.daily-dice .daily-dice-result-block h3 span').html() +'</b> in daily dice roll. Reward:<br>',
                'pl': '<b>' +$('.name-char').html() +'</b> wylosował' +($('.name-char').html().match(/a$/i) ?'a' :'') +' <b>' +$('#modal .modal-window.daily-dice .daily-dice-result-block h3 span').html() +'</b> z dziennego rzutu kością. Nagroda:<br>',
            }));*/
            scaBot.log($reward.clone());
            
            // click OK
            $('#modal .modal-window.daily-dice button[onclick="client.scaCheckDailies();"]').trigger('click');
            
            // debug log or rethink
            if(scaBot.debug){
                console.log('[NWO::SCA bot] .think(): Daily reward: Click OK.');
            }
            
            return;
        }
    }
    
    // select dungeon
    if($('#content_dungeons .overworld-locations').length){
        scaBot.status(scaBot.translate({
            'en': 'Choosing dungeon: <b>Tier 6</b>.',
            'pl': 'Wybieranie podziemia: <b>Tier 6</b>.',
        }));
        client.scaSetQuest('d6');
        client.scaConfirmQuest();
        
        // debug log or rethink
        if(scaBot.debug){
            console.log('[NWO::SCA bot] .think(): Select Dungeon.');
        }
        
        return;
    }
    
    // select party for dungeon
    if($('#content_dungeons .page-dungeon-chooseparty').length){
        // click OK
        if($('#modal .modal-window button[onclick="client.scaConfirmParty()"]').length){
            client.scaConfirmParty();
            
            // debug log or rethink
            if(scaBot.debug){
                console.log('[NWO::SCA bot] .think(): Select Dungeon: Click OK.');
            }
            
            return;
        }
        
        scaBot.status(scaBot.translate({
            'en': 'Select Party for dungeon.',
            'pl': 'Wybieranie drużyny do pozdiemia.',
        }), true);
        
        // debug log or rethink
        if(scaBot.debug){
            console.log('[NWO::SCA bot] .think(): Select Party for Dungeon.');
        }
        
        scaBot.dungeonSelectParty();
        return;
    }
    
    // see encounter
    if($('#modal .modal-window .dungeon-encounter').length){
        if(scaBot.encounterEnter !== undefined){
            scaBot.encounterEnterID = scaBot.encounterEnter;
            scaBot.encounterEnter = undefined;
            
            if(scaBot.debug){
                console.log('[NWO::SCA bot] .think(): Enter chosen encounter.');
            }
            
            scaBot.status(scaBot.translate({'en':'Entering chosen encounter.', 'pl':'Wejście do wybranej potyczki.'}));
            
            scaBot.encounterSelectParty();
            return;
        }
        
        if(scaBot.encounter === undefined){
            client.scaConfirmEncounter();
            
            scaBot.status(scaBot.translate({'en':'Leaving unknown encounter.', 'pl':'Opuszczanie nieznanej potyczki.'}));
            
            // debug log or rethink
            if(scaBot.debug){
                console.log('[NWO::SCA bot] .think(): Leaving unknown encounter.');
            }
            
            return;
        }
        
        if(scaBot.debug){
            console.log('[NWO::SCA bot] .think(): Read encounter.');
        }
        
        scaBot.status(scaBot.translate({'en':'Reading encounter.', 'pl':'Oglądanie potyczki.'}));
        
        scaBot.readEncounter();
        return;
    }
    
    // won encounter
    if($('#modal .modal-window .combat-victory .companion-rewards-block').length){
        $reward = $('#modal .modal-window .combat-victory .companion-rewards-block .combat-rewards .reward').clone();
        $reward.find('.inner H4').css('color', 'black');
        
        var shot = $('#modal .modal-window .combat-victory .party-entry .party-head').attr('src');
        
        $team = $('<table>').css({'margin-top': '10px', 'margin-bottom': '10px'});
        $team.append($('<tr>')
            .append($('<td>').css('padding', '0').html($('<img>').attr('src', shot).attr({'width': '32px', 'height': '32px'})))
            .append($('<td>').css('padding-left', '10px').html(scaBot.translate({
                'en': '<b>' +$('.party-name').html() +'</b> won encounter.<br>Pending reward:',
                'pl': '<b>' +$('.party-name').html() +'</b> wygrał' +($('.party-name').html().match(/a$/i) ?'a' :'') +' potyczkę.<br>Nadchodząca nagroda:',
            })))
        );

        scaBot.status($team);
        scaBot.status($reward, true);
        
        /*$team = $('<table>').css({'margin-top': '10px', 'margin-bottom': '10px'});
        $team.append($('<tr>')
            .append($('<td>').css('padding', '0').html($('<img>').attr('src', shot).attr({'width': '32px', 'height': '32px'})))
            .append($('<td>').css('padding-left', '10px').html(scaBot.translate({
                'en': '<b>' +$('.name-char').html() +'</b>`s <b>' +$('.party-name').html() +'</b> won encounter.<br>Pending reward:',
                'pl': '<b>' +$('.name-char').html() +'</b>: <b>' +$('.party-name').html() +'</b> wygrał' +($('.party-name').html().match(/a$/i) ?'a' :'') +' potyczkę.<br>Nadchodząca nagroda:',
            })))
        );

        scaBot.log($team);
        scaBot.log($reward.clone());*/

        // click OK
        client.scaCombatDone();

        // debug log or rethink
        if(scaBot.debug){
            console.log('[NWO::SCA bot] .think(): Won encounter: Click OK.');
        }
        
        // clean available encounters
        delete scaBot.encounters[scaBot.encounterEnterID];
        
        return;
    }
    
    // lost encounter
    if($('#modal .modal-window .combat-defeat').length){
        scaBot.status(scaBot.translate({'en':'Lost encounter.', 'pl':'Potyczka przegrana.'}));

        // click OK
        client.scaCombatDone();

        // debug log or rethink
        if(scaBot.debug){
            console.log('[NWO::SCA bot] .think(): Lost encounter: Click OK.');
        }
        
        return;
    }
    
    // lost dungeon
    if($('#modal .modal-window .modal-confirm.leave [data-url-silent="/adventures/leavevictory"]').length){
        scaBot.status(scaBot.translate({'en':'Lost dungeon.', 'pl':'Podziemie przegrane.'}), true);

        // click OK
        $('#modal .modal-window .modal-confirm.leave [data-url-silent="/adventures/leavevictory"]').trigger('click');

        // debug log or rethink
        if(scaBot.debug){
            console.log('[NWO::SCA bot] .think(): Lost dungeon: Click OK.');
        }
        
        // clean available encounters
        scaBot.encounters = [];
        
        // reset level
        scaBot.level = -1;
        $('#SCAbotLevel').hide();
        $('#SCAbotBoss').hide();
        scaBot.boss = false;
        
        return;
    }
    
    // return to town
    if($('#modal .modal-window .modal-confirm.leave .leave-rewards').length){
        $reward = $('#modal .modal-window .modal-confirm.leave .leave-rewards .reward').clone();
        $reward.find('.inner H4').css('color', 'black');

        scaBot.status(scaBot.translate({
            'en': 'Reward:<br>',
            'pl': 'Nagroda:<br>',
        }), true);
        scaBot.status($reward, true);
        scaBot.log($reward.clone());

        // click OK
        client.scaQuestDone();

        // debug log or rethink
        if(scaBot.debug){
            console.log('[NWO::SCA bot] .think(): Return to town: Click OK.');
        }
        
        // clean available encounters
        scaBot.encounters = [];
        
        // reset level
        scaBot.level = -1;
        $('#SCAbotLevel').hide();
        $('#SCAbotBoss').hide();
        scaBot.boss = false;
        
        return;
    }
    
    // select encounter
    if($('#content_box #content_login #content_dungeons .explore-map .dungeon-map').length){
        // check HP
        var hp = 0|$('#content_box #content_login #content_dungeons .dungeon-health-bar .bar-filled.health-now').attr('style').match(/width: (\d+(?:\.\d+)?)%;/)[1];
        if(hp < 15){
            // leave dungeon
            $('#content_box #content_login #content_dungeons .explore-map [data-url-silent="/adventures/leaveconfirm"].exit').trigger('click');
            
            scaBot.status(scaBot.translate({'en':'One HP left only.<br><b>Leaving dungeon</b>.', 'pl':'Zostało ostatnie życie.<br><b>Opuszczam potyczkę</b>.'}));
            
            if(scaBot.debug){
                console.log('[NWO::SCA bot] .think(): Leave dungeon.');
            }
            
            return;
        }
        
        scaBot.readMap();
        scaBot.status(scaBot.translate({'en':'Select encounter.', 'pl':'Wybieranie potyczki.'}));
        
        for(var encounter in scaBot.map){
            if(!(scaBot.map[encounter].id in scaBot.encounters)){
                if(scaBot.map[encounter].type == 0 || scaBot.map[encounter].type == 3 || scaBot.map[encounter].type == 4){
                    scaBot.encounter = scaBot.map[encounter].id;
                    
                    $('#content_box #content_login #content_dungeons .explore-map .dungeon-map [data-encounter-id="' +scaBot.encounter +'"]').trigger('click');
                    scaBot.status('Read encounter #<b>' +scaBot.encounter +'</b>.', true);
                    
                    // debug log or rethink
                    if(scaBot.debug){
                        console.log('[NWO::SCA bot] .think(): Read encounter #' +scaBot.encounter +'.');
                    }
                    
                    return;
                }
            }
        }
        
        if(scaBot.debug){
            console.log('[NWO::SCA bot] .think(): Determine encounter.');
        }
        
        scaBot.status(scaBot.translate({'en':'Choose encounter.', 'pl':'Wybieranie potyczki.'}));
        
        // all encounters are known
        scaBot.determineEncounter();
    }
    
    // select die in encounter
    if($('#content_dungeons .challenge-container').length){
        if(scaBot.debug){
            console.log('[NWO::SCA bot] .think(): Choose die in encounter.');
        }
        
        scaBot.status(scaBot.translate({'en':'Choose die in encounter.', 'pl':'Wybieranie kości w potyczce.'}));
        
        scaBot.encounterSelectDie();
    }
    
    // no action found
};

// 0. onload
$(function(){
    scaBot.hashCheck();
});

// 1. onhashchange
$(window).bind('hashchange', function(){
    scaBot.hashCheck();
});
