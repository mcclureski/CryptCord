//META{"name":"CryptCord"}*//

class CryptCord {
    constructor(){
        this.toggle = false; //ignore this
        this.key = "0123456789ABCDEF0123456789ABCDEF"; //Default key, u can change this in settings.

        //load libs etc
        var libraryScript = document.createElement("script");
		libraryScript.setAttribute("type", "text/javascript");
		libraryScript.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/core-min.js");
        document.head.appendChild(libraryScript);

	    libraryScript = document.createElement("script");
		libraryScript.setAttribute("type", "text/javascript");
		libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
		document.head.appendChild(libraryScript);
        
        libraryScript = document.createElement("script");
		libraryScript.setAttribute("type", "text/javascript");
		libraryScript.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/sha256.js");
        document.head.appendChild(libraryScript);
        
        libraryScript = document.createElement("script");
		libraryScript.setAttribute("type", "text/javascript");
		libraryScript.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/components/enc-base64.js");
        document.head.appendChild(libraryScript);
        
        libraryScript = document.createElement("script");
		libraryScript.setAttribute("type", "text/javascript");
		libraryScript.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js");
        document.head.appendChild(libraryScript);  
    }

    getName        () { return "CryptCord"; }
    getDescription () { return "Encrypt your messages on discord with a secret key, Hiding your messages from others and even Discord!"; }
    getVersion     () { return "0.0.3"; }
    getAuthor      () { return "Mcclures"; }

    encrypt(text){
        try {
            return CryptoJS.AES.encrypt(text, this.key);
        } catch(err) {
            return err;
        }
    }

    decrypt(text){
        try {
            return CryptoJS.AES.decrypt(text, this.key).toString(CryptoJS.enc.Utf8);
        } catch(err) {
            return err;
        }
    }

    formatMsg(msg){
        var bold = /\*\*([^*]+)\*\*/g;
        var italic = /\*([^*]+)\*/g;
        var underline = /\_([^*]+)\_/g;
        var strike = /\~\~([^*]+)\~\~/g;

        var url = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

        var inline = /\`([^*]+)\`/g;

        var codeblocksingle = /\`\`\`([^*]+)\`\`\`/g;
        var codeblockmulti = /\`\`\`(\w+)\n((?:(?!\`\`\`)[\s\S])*)\`\`\`/g;

        msg = msg.replace(bold, "<b>$1</b>");
        msg = msg.replace(italic, "<i>$1</i>");
        msg = msg.replace(underline, "<U>$1</U>");
        msg = msg.replace(strike, "<s>$1</s>");
        msg = msg.replace(codeblockmulti, `<pre><code class="scrollbarGhost-2F9Zj2 scrollbar-3dvm_9 hljs $1" style="position: relative;">$2</code></pre>`);
        msg = msg.replace(codeblocksingle, `<pre><code class="scrollbarGhost-2F9Zj2 scrollbar-3dvm_9 hljs" style="position: relative;">$1</code></pre>`);
        msg = msg.replace(inline, `<code class="inline">$1</code>`);
        msg = msg.replace(url, "<a href='$1'>$1</a>");
        
        return msg;
    }

    decryptAll(){
        var data = PluginUtilities.loadData("Encrypt", "key");
        this.key = data.key;
        var self = this;
        $(".markup").each(function(){
            var i = $(this).html();
            if(i.startsWith('\u200B')){
                $(this).html(function (_, html) {
                    console.log(i);
                    var encrypted = i.replace('\u200B', "");
                    var decrypted = self.decrypt(encrypted);
                    if(decrypted == "" || decrypted == " " || decrypted == null || !decrypted || decrypted.length < 1){
                        return html.replace(i, '<span style="color: #e21f1f;">'+self.formatMsg(encrypted)+'</span>');
                    } else if(decrypted.toString().toLowerCase().includes("error")) {
                        return html.replace(i, '<span style="color: #e21f1f;">'+self.formatMsg(decrypted)+'</span>');
                    } else {
                        return html.replace(i, '<span style="color: #28e24e;">'+self.formatMsg(decrypted)+'</span>');
                    }
                });
            }
        });
    }

    start(){
        setTimeout(function(){console.log("[CryptCord] Init Etc")}, 10000);

        var self = this;
        $(window).bind('keydown', function(e){
            if(e.altKey && e.keyCode === 13){
                console.log("[CryptCord] Alt Pressed Sir");
                var textarea = $("textarea");
                $("textarea").focus();
                $("textarea").select();
                if(!textarea.html() || textarea.html == ""){

                } else {
                    if(this.toggle){
                        var encryp = self.encrypt(textarea.html());
                        document.execCommand("insertText", false, "\u200B"+encryp);
                        this.toggle = false;
                    } else {
                        var decryp = self.decrypt($("textarea").html().replace("\u200B", ""));
                        document.execCommand("insertText", false, ""+decryp);
                        this.toggle = true;
                    }
                }
            }
            if(e.keyCode === 13 && !e.altKey){
                this.toggle = true;
                self.decryptAll();
            }
        });
        console.log(this.formatMsg("```cs urmom```"));
    }

    saveSettings(){
        this.key = $("#zugg").val();
        PluginUtilities.saveData("Encrypt", "key", {key: this.key});
    }

    getSettingsPanel(){
        var data = PluginUtilities.loadData("Encrypt", "key");
        if(!data.key) { data.key = this.key; }
        return `<div style="color: white; padding: 20px;">
            Key: <input id="zugg" style="padding: 10px; width:70%;outline:none;color: white;border: none; border-radius: 5px; background-color: hsla(218,5%,47%,.3);" value=${data.key}><br><br>
            <button onclick="BdApi.getPlugin('${this.getName()}').saveSettings()" style="background: #7289da;color: #FFF;border-radius: 5px;">Save Settings</button>
        </div>`;
    }

    stop(){
        $(window).unbind('keydown');
    }

    load(){
        
    }

    unload(){

    }

    observer(mutation) {
        this.decryptAll();
    }

    onSwitch(){
        var self = this;
        if($(".name-3YKhmS").html().startsWith("U2")){
            var decrypted = this.decrypt($(".name-3YKhmS").html());
            if(decrypted == "" || decrypted == " " || decrypted == null || !decrypted || decrypted.length < 1){

            } else if(decrypted.toString().toLowerCase().includes("error")) {

            } else {
                $(".name-3YKhmS").html('<span style="color: #28e24e;">'+decrypted+'</span>');
            }
        }
        if($(".topic-2QX7LI").html().startsWith("U2")){
            var decrypted = this.decrypt($(".topic-2QX7LI").html());
            if(decrypted == "" || decrypted == " " || decrypted == null || !decrypted || decrypted.length < 1){
                
            } else if(decrypted.toString().toLowerCase().includes("error")) {
                
            } else {
                $(".topic-2QX7LI").html('<span style="color: #28e24e;">'+decrypted+'</span>');
            }
        }
        $(".membersGroup-v9BXpm").each(function(){
            var ii = $(this);
            var ie = ii.html().split("—");
            var i = ie[0];
            var decrypted = self.decrypt(i);
            if(decrypted == "" || decrypted == " " || decrypted == null || !decrypted || decrypted.length < 1){
               
            } else if(decrypted.toString().toLowerCase().includes("error")) {
                
            } else {
                ii.html('<span style="color: #28e24e;">'+decrypted+'</span>'+"—"+ie[1]);
            }
        })
        this.decryptAll();
    }
}
