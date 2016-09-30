# NWO-SCA-bot
### Neverwinter Online :: Sword Coast Adventures bot
jQuery Neverwinter [userscript](https://greasyfork.org/en) — bot that used to automatically solve Sword Coast Adventures at Neverwinter [gateway](http://gateway.playneverwinter.com).

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
