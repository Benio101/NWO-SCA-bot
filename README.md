# NWO::SCA bot
## Neverwinter Online :: Sword Coast Adventures bot
jQuery Neverwinter [userscript](https://greasyfork.org/en) — bot that used to automatically solve Sword Coast Adventures at Neverwinter [gateway](http://gateway.playneverwinter.com).

## Video
Video from late beta (04.08.2015):

[![Video from Beta](http://img.youtube.com/vi/eenbtrDdcJY/0.jpg)](http://www.youtube.com/watch?v=eenbtrDdcJY)

## GUI
Bot GUI was available in two languages:
- English
- Polish

Bot provided following feutures:
- Status info panel
- Earned Rewards info panel
- Single Step *(useful for debugging and testing)*
- Change Language
- Start
- Stop
- Pause

## Console Log
Bot used to output descriptive logs in browser console.

### Usage
Bot was automatically adding white panel to the right side of screen once entering Sword Coast Adventures tab.

Clicking Start began automatically solving the whole Sword Coast Adventures multiple times, until all companions was eventually exhausted.

Autorun state was saved beetween sessions, so all configuration requires to simply click the Start button once.


**Fun fact**: Earned rewards, beside bot GUI, was shown real–time ingame.

## Functionality
Bot was automatically taking many important, mathy decisions, including *choosing/caclulating/executing/…*:
- daily reward
- select dungeon
- select party for dungeon
- see encounter
- won encounter
- lost encounter
- lost dungeon
- return to town
- select encounter
- select die in encounter
- read companions
- read party
- read map
- read encounter
- determine encounter to go
- determine party for encounter
- select die in encounter
- *…and more*

Descriptive details are available in userscript comments.

### Manifest
Since [gateway is down](http://www.arcgames.com/en/games/neverwinter/news/detail/10161142-gateway-closing-down) (15 Sep 2016), and I don't play Neverwinter anymore, I proudly present SCA bot I was using everyday in background, while playing Neverwinter, to make about 1M AD per day.
The code is presented for pure historical reason, since it's unusable nowadays.

### Combatibility
NWO SCA bot was fully compatible with [Neverwinter gateway — Professions Robot](https://greasyfork.org/pl/scripts/9812-neverwinter-gateway-professions-robot/code?version=101630).

Professions Robot .diff vs [version 101630](https://greasyfork.org/pl/scripts/9812-neverwinter-gateway-professions-robot/code?version=101630) (where `NAME@HANDLE` is character full identifier):
```diff
4d3
< // @namespace https://greasyfork.org/scripts/9812-neverwinter-gateway-professions-robot/
160,162c159,161
<     $('#help-dimmer.help-cont.whenTutorialActive').waitUntilExists(function() {
<         client.toggleHelp();
<     });
---
>     //$('#help-dimmer.help-cont.whenTutorialActive').waitUntilExists(function() {
>     //    client.toggleHelp();
>     //});
4029,4032c4028,4035
<         if (runSCA) {
<             unsafeWindow.location.hash = unsafeWindow.location.hash.replace(/\)\/.+/, ')' + "/adventures");
<             processCharSCA(lastCharNum);
<             return;
---
>         //if (runSCA) {
>         //    unsafeWindow.location.hash = unsafeWindow.location.hash.replace(/\)\/.+/, ')' + "/adventures");
>         //    processCharSCA(lastCharNum);
>         //    return;
>         //}
>         
>         if(chardelay > 15000){
>             unsafeWindow.location.hash = '#char(NAME@HANDLE)/adventures';
```
