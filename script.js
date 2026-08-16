let users=JSON.parse(localStorage.getItem("mhUsers")||"{}"),session=localStorage.getItem("mhSession"),media=[],socials=[],current=null,loginMode="login";
const $=id=>document.getElementById(id);
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function toast(s){$("toast").textContent=s;$("toast").classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>$("toast").classList.remove("show"),2200)}
function save(){if(session){localStorage.setItem("mhMedia_"+session,JSON.stringify(media));localStorage.setItem("mhSocial_"+session,JSON.stringify(socials))}}
function load(){media=JSON.parse(localStorage.getItem("mhMedia_"+session)||"[]");socials=JSON.parse(localStorage.getItem("mhSocial_"+session)||"[]")}
function boot(){if(session){load();$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");$("userLabel").textContent="👤 "+session;renderAll()}}boot();

$("switchAuth").onclick=()=>{loginMode=loginMode==="login"?"register":"login";$("authTitle").textContent=loginMode==="login"?"Welcome back":"Create account";$("authBtn").textContent=loginMode==="login"?"Login":"Sign up";$("switchAuth").textContent=loginMode==="login"?"Create a new account":"I already have an account"};
let loginAttempts=Number(sessionStorage.getItem("mhAttempts")||"0");
$("authBtn").onclick=()=>{
 let u=$("username").value.trim(),p=$("password").value;
 if(!u||!p)return toast("Enter username and password.");
 if(loginMode==="register"){
   if(users[u])return toast("Username already exists.");
   users[u]=p;localStorage.setItem("mhUsers",JSON.stringify(users));
   toast("Account created. Now login.");
   loginMode="login";$("authTitle").textContent="Welcome back";$("authBtn").textContent="Login";$("switchAuth").textContent="Create a new account";
   return;
 }
 if(loginAttempts>=3){
   $("authBtn").disabled=true;$("username").disabled=true;$("password").disabled=true;
   return toast("ACCESS BLOCKED! Too many incorrect attempts.");
 }
 if(!users[u]||users[u]!==p){
   loginAttempts++;
   sessionStorage.setItem("mhAttempts",loginAttempts);
   $("password").value="";
   if(loginAttempts>=3){
     $("authTitle").textContent="Access Blocked";
     $("authBtn").disabled=true;$("username").disabled=true;$("password").disabled=true;
     toast("ACCESS BLOCKED! 3 incorrect attempts.");
   }else{
     let left=3-loginAttempts;
     toast("Incorrect password! "+left+" attempt"+(left===1?"":"s")+" remaining.");
   }
   return;
 }
 loginAttempts=0;sessionStorage.removeItem("mhAttempts");
 session=u;localStorage.setItem("mhSession",session);boot()
};
$("logoutBtn").onclick=()=>{localStorage.removeItem("mhSession");location.reload()};
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
function showPage(id){document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));$(id).classList.remove("hidden");document.querySelectorAll(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.page===id));if(id==="library")renderMedia();if(id==="favorites")renderFavorites()}

function detect(url){
 let u=url.toLowerCase();
 if(u.includes("spotify.com/")||u.includes("spotify.link/"))return "spotify";
 if(u.includes("youtube.com/")||u.includes("youtu.be/"))return "youtube";
 if(/\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(url))return "video";
 return "audio";
}
function youtubeId(url){try{let u=new URL(url);if(u.hostname.includes("youtu.be"))return u.pathname.slice(1).split("/")[0];return u.searchParams.get("v")}catch{return null}}
function spotifyEmbed(url){
 let m=url.match(/open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/i);
 return m?`https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`:null;
}

$("addUrl").onclick=async()=>{
 let url=$("urlInput").value.trim(),title=$("titleInput").value.trim();
 if(!url)return toast("Paste a Spotify, YouTube, MP3 or MP4 link.");
 let type=detect(url);
 if(type==="audio"&&!/^https?:\/\//i.test(url))return toast("Use a valid URL.");
 let item={id:Date.now()+Math.random(),title:title||(type==="spotify"?"Spotify Music":type==="youtube"?"YouTube Video":"Online Media"),url,type,favorite:false,added:Date.now(),local:false};
 media.unshift(item);save();$("urlInput").value="";$("titleInput").value="";
 renderAll();play(item.id);
 toast(type==="spotify"?"Spotify link added to player.":type==="youtube"?"YouTube link added.":"Media link added.");
};
$("fileInput").onchange=e=>{[...e.target.files].forEach(f=>media.unshift({id:Date.now()+Math.random(),title:f.name,url:URL.createObjectURL(f),type:f.type.startsWith("video")?"video":"audio",favorite:false,added:Date.now(),local:true}));save();renderAll();if(e.target.files[0])play(media[0].id);e.target.value=""};

function renderAll(){renderMedia();renderFavorites();renderSocials();$("mediaCount").textContent=media.length;$("favCount").textContent=media.filter(x=>x.favorite).length;$("socialCount").textContent=socials.length}
function empty(t){return `<div class="media-item" style="display:block;text-align:center;padding:35px;color:var(--muted)">${t}</div>`}
function itemCard(x){let icon=x.type==="video"?"🎬":x.type==="spotify"?"🟢":x.type==="youtube"?"🔴":"🎵";return `<div class="media-item"><div class="media-icon">${icon}</div><div onclick="play('${x.id}')" style="cursor:pointer"><div class="media-title">${esc(x.title)}</div><div class="media-meta">${x.type.toUpperCase()} • ${x.local?"Local file":"Online"}</div></div><div class="item-actions"><button class="mini fav" onclick="favorite('${x.id}')">${x.favorite?"♥":"♡"}</button><button class="mini" onclick="play('${x.id}')">▶</button><button class="mini" onclick="openMedia('${x.id}')">↗</button><button class="mini" onclick="removeMedia('${x.id}')">✕</button></div></div>`}
function renderMedia(){let q=($("search")?.value||"").toLowerCase(),a=media.filter(x=>x.title.toLowerCase().includes(q));let s=$("sort")?.value||"new";if(s==="az")a.sort((x,y)=>x.title.localeCompare(y.title));if(s==="fav")a.sort((x,y)=>Number(y.favorite)-Number(x.favorite));if(s==="new")a.sort((x,y)=>y.added-x.added);$("mediaList").innerHTML=a.length?a.map(itemCard).join(""):empty("No media found.")}
function renderFavorites(){let a=media.filter(x=>x.favorite);$("favoriteList").innerHTML=a.length?a.map(itemCard).join(""):empty("No favorites yet.")}
$("search").oninput=renderMedia;$("sort").onchange=renderMedia;

const audio=$("audio"),video=$("video"),embed=$("embedBox");
function stop(){audio.pause();video.pause();audio.style.display="none";video.style.display="none";embed.style.display="none";embed.innerHTML=""}
function play(id){let x=media.find(m=>String(m.id)===String(id));if(!x)return;current=x;stop();$("nowTitle").textContent=x.title;$("nowMeta").textContent=x.type.toUpperCase()+" • "+(x.local?"Local file":"Online");$("favCurrent").textContent=x.favorite?"♥":"♡";$("cover").textContent=x.type==="video"?"🎬":x.type==="spotify"?"🟢":x.type==="youtube"?"▶":"♪";
 if(x.type==="spotify"){let src=spotifyEmbed(x.url);if(!src)return toast("Unsupported Spotify URL.");embed.innerHTML=`<iframe src="${src}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;embed.style.display="block";$("play").disabled=true;$("seek").disabled=true;return}
 if(x.type==="youtube"){let id=youtubeId(x.url);if(!id)return toast("Invalid YouTube URL.");embed.innerHTML=`<iframe src="https://www.youtube.com/embed/${id}?rel=0" title="YouTube player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;embed.style.display="block";$("play").disabled=true;$("seek").disabled=true;return}
 $("play").disabled=false;$("seek").disabled=false;let p=x.type==="video"?video:audio;p.src=x.url;p.style.display="block";p.volume=Number($("volume").value);p.play().then(()=>$("play").textContent="⏸").catch(()=>{$("play").textContent="▶";toast("Press Play if autoplay is blocked.")})}
function active(){return current?(current.type==="video"?video:audio):null}
$("play").onclick=()=>{let p=active();if(!p)return toast("Spotify/YouTube has its own controls.");if(p.paused){p.play();$("play").textContent="⏸"}else{p.pause();$("play").textContent="▶"}}
function step(n){if(!current||!media.length)return;let i=media.findIndex(x=>String(x.id)===String(current.id));i=(i+n+media.length)%media.length;play(media[i].id)}
$("prev").onclick=()=>step(-1);$("next").onclick=()=>step(1);
[audio,video].forEach(p=>{p.onplay=()=>$("play").textContent="⏸";p.onpause=()=>$("play").textContent="▶";p.ontimeupdate=()=>{if(p.duration){$("seek").value=p.currentTime/p.duration*100;$("cur").textContent=time(p.currentTime);$("dur").textContent=time(p.duration)}};p.onended=()=>step(1)});
function time(n){return isFinite(n)?Math.floor(n/60)+":"+String(Math.floor(n%60)).padStart(2,"0"):"0:00"}
$("seek").oninput=()=>{let p=active();if(p&&p.duration)p.currentTime=$("seek").value/100*p.duration};$("volume").oninput=()=>{audio.volume=video.volume=Number($("volume").value)};
function favorite(id){let x=media.find(m=>String(m.id)===String(id));if(!x)return;x.favorite=!x.favorite;save();renderAll();if(current&&String(current.id)===String(id))$("favCurrent").textContent=x.favorite?"♥":"♡"}
$("favCurrent").onclick=()=>current&&favorite(current.id);
function removeMedia(id){media=media.filter(x=>String(x.id)!==String(id));if(current&&String(current.id)===String(id)){current=null;stop();$("nowTitle").textContent="Nothing selected";$("nowMeta").textContent="Choose a song or video";$("cover").textContent="♪"}save();renderAll();toast("Removed.")}
function openMedia(id){let x=media.find(m=>String(m.id)===String(id));if(x)window.open(x.url,"_blank","noopener")}
$("openCurrent").onclick=()=>current&&openMedia(current.id);
$("download").onclick=()=>{if(!current)return;let a=document.createElement("a");a.href=current.url;a.download=current.title;a.target="_blank";document.body.appendChild(a);a.click();a.remove();toast("Download requested. Some services block downloads.")};

$("addSocial").onclick=()=>{let n=$("socialName").value.trim(),u=$("socialUrl").value.trim();if(!n||!u)return toast("Enter name and URL.");try{new URL(u)}catch{return toast("Enter a valid URL.")}socials.unshift({id:Date.now(),name:n,url:u});save();$("socialName").value="";$("socialUrl").value="";renderSocials();renderAll()};
function renderSocials(){$("socialList").innerHTML=socials.length?socials.map(x=>`<div class="social-card"><h3>🔗 ${esc(x.name)}</h3><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.url)}</a><br><button class="ghost" onclick="removeSocial(${x.id})">Remove</button></div>`).join(""):empty("Add Spotify, YouTube, Instagram, TikTok, Discord or any other link.")}
function removeSocial(id){socials=socials.filter(x=>x.id!==id);save();renderSocials();renderAll()}
$("themeBtn").onclick=()=>document.body.classList.toggle("light");

let shuffleMode=false, repeatMode=false;
$("shuffle").onclick=()=>{shuffleMode=!shuffleMode;$("shuffle").style.color=shuffleMode?"#a96cff":"";toast(shuffleMode?"Shuffle on":"Shuffle off")};
$("repeat").onclick=()=>{repeatMode=!repeatMode;$("repeat").style.color=repeatMode?"#a96cff":"";toast(repeatMode?"Repeat on":"Repeat off")};
const oldStep=step;
step=function(n){
 if(!media.length)return;
 if(shuffleMode && media.length>1){
   let next;
   do{next=media[Math.floor(Math.random()*media.length)]}while(current && String(next.id)===String(current.id));
   return play(next.id);
 }
 let i=current?media.findIndex(x=>String(x.id)===String(current.id)):0;
 i=(i+n+media.length)%media.length;
 play(media[i].id);
};
[audio,video].forEach(p=>{
 const oldEnded=p.onended;
 p.onended=()=>{if(repeatMode&&current){p.currentTime=0;p.play();}else step(1)}
});
document.addEventListener("keydown",e=>{
 if(e.code==="Space" && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)){
   e.preventDefault();$("play").click();
 }
});
