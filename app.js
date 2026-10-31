let token=localStorage.getItem("amo_token"), supabaseClient=null, authMode="login", supaUser=null;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

async function initBackend(){
  try{
    const c=await fetch("/api/config").then(r=>r.json());
    if(c.supabaseUrl && c.supabaseAnonKey && window.supabase){
      supabaseClient=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey);
      const {data}=await supabaseClient.auth.getSession();
      if(data.session){supaUser=data.session.user;token=data.session.access_token;localStorage.setItem("amo_token",token)}
    }
  }catch{}
}
async function api(url,opts={}){
  opts.headers={...(opts.headers||{}),...(token?{Authorization:"Bearer "+token}:{}),...(opts.body?{"Content-Type":"application/json"}:{})};
  const r=await fetch(url,opts);const d=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(d.error||"Request failed");return d;
}
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2500)}
function showApp(){if(!token)return;$("#auth").classList.add("hidden");$("#app").classList.remove("hidden");loadDashboard();loadBusiness();loadCampaigns();loadMeta();if(supaUser)$("#userLabel").textContent=supaUser.email||"Workspace"}
function showAuth(){token=null;supaUser=null;localStorage.removeItem("amo_token");$("#auth").classList.remove("hidden");$("#app").classList.add("hidden")}
$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");authMode=b.dataset.auth;$("#auth").classList.toggle("signup",authMode==="signup");$("#authBtn").textContent=authMode==="signup"?"Create account":"Login"});
$("#authBtn").onclick=async()=>{
  try{
    const email=$("#authEmail").value.trim(), password=$("#authPassword").value;
    if(!supabaseClient) { token="demo"; localStorage.setItem("amo_token",token); $("#userLabel").textContent=$("#authName").value||"Demo User"; showApp(); toast("Demo mode — add Supabase in Netlify for real accounts"); return; }
    let result;
    if(authMode==="signup"){
      result=await supabaseClient.auth.signUp({email,password,options:{data:{name:$("#authName").value}}});
      if(result.error)throw result.error;
      if(!result.data.session){$("#authMsg").textContent="Check your email to confirm your account.";return}
    }else{
      result=await supabaseClient.auth.signInWithPassword({email,password});
      if(result.error)throw result.error;
    }
    supaUser=result.data.user;token=result.data.session.access_token;localStorage.setItem("amo_token",token);showApp();
  }catch(e){$("#authMsg").textContent=e.message}
};
$("#logout").onclick=async()=>{if(supabaseClient)await supabaseClient.auth.signOut();showAuth()};
$$(".nav").forEach(b=>b.onclick=()=>{$$(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");$$(".page").forEach(p=>p.classList.remove("active"));$("#"+b.dataset.page).classList.add("active");$("#pageTitle").textContent=b.textContent.trim();if(innerWidth<900)$("#menu").click()});
$("#menu").onclick=()=>document.querySelector("aside").classList.toggle("open");

async function loadDashboard(){
 try{
  if(supabaseClient&&supaUser){
   const {data:cs}=await supabaseClient.from("campaigns").select("*").order("created_at",{ascending:false});
   const {count}=await supabaseClient.from("leads").select("*",{count:"exact",head:true});
   const spend=(cs||[]).reduce((a,c)=>a+Number(c.spend||0),0);
   $("#mSpend").textContent="₹"+spend.toLocaleString("en-IN");$("#mLeads").textContent=count||0;
  }
 }catch{}
}
async function loadBusiness(){
 try{
  if(!supabaseClient||!supaUser)return;
  const {data:b}=await supabaseClient.from("businesses").select("*").eq("user_id",supaUser.id).maybeSingle();
  if(!b)return;
  for(const [id,key] of [["bizName","name"],["bizIndustry","industry"],["bizLocation","location"],["bizWebsite","website"],["bizOffer","offer"],["bizAudience","audience"],["bizGoal","goal"],["bizBudget","budget"]])$("#"+id).value=b[key]||"";
 }catch{}
}
$("#saveBiz").onclick=async()=>{
 try{
  if(!supabaseClient||!supaUser){toast("Connect Supabase in Netlify for saved business data");return}
  const payload={user_id:supaUser.id,name:$("#bizName").value,industry:$("#bizIndustry").value,location:$("#bizLocation").value,website:$("#bizWebsite").value,offer:$("#bizOffer").value,audience:$("#bizAudience").value,goal:$("#bizGoal").value,budget:$("#bizBudget").value};
  const {error}=await supabaseClient.from("businesses").upsert(payload,{onConflict:"user_id"});if(error)throw error;toast("Business profile saved")
 }catch(e){toast(e.message)}
};

async function askAI(text){
 const m=$("#chatMessages");m.insertAdjacentHTML("beforeend",`<div class="bubble user">${text.replaceAll("<","&lt;")}</div>`);
 const thinking=document.createElement("div");thinking.className="bubble ai";thinking.textContent="Thinking…";m.appendChild(thinking);m.scrollTop=m.scrollHeight;
 try{const d=await api("/api/ai/chat",{method:"POST",body:JSON.stringify({message:text})});thinking.innerHTML="<b>AI Marketing Strategist</b><br>"+d.reply.replaceAll("\n","<br>")}catch(e){thinking.textContent=e.message}
 m.scrollTop=m.scrollHeight;
}
$("#chatSend").onclick=()=>{const x=$("#chatInput");if(x.value.trim()){askAI(x.value.trim());x.value=""}};
$("#chatInput").onkeydown=e=>{if(e.key==="Enter")$("#chatSend").click()};
$$(".chips button").forEach(b=>b.onclick=()=>askAI(b.textContent));
$("#heroAsk").onclick=()=>{const x=$("#heroPrompt").value.trim();if(x){document.querySelector('[data-page="assistant"]').click();askAI(x)}};

async function loadCampaigns(){
 const box=$("#campaignList");
 try{
  let items=[];
  if(supabaseClient&&supaUser){const {data}=await supabaseClient.from("campaigns").select("*").order("created_at",{ascending:false});items=data||[]}
  if(!items.length)items=[{name:"Lead Generation — Demo",status:"Demo",spend:18450,leads:242,cpl:76,roas:2.8}];
  box.innerHTML=items.map(c=>`<div class="card campaign"><div><span class="tag ${c.status==="Active"?"green":""}">${c.status||"Draft"}</span><h3>${c.name}</h3><p>AI campaign workspace</p></div><div class="stats"><span>Spend ₹${Number(c.spend||0).toLocaleString("en-IN")}</span><span>Leads ${c.leads||0}</span><span>CPL ₹${c.cpl||"—"}</span></div></div>`).join("")
 }catch{}
}
async function createCampaign(){
 const goal=prompt("What is the campaign goal?","Lead Generation");if(!goal)return;
 try{
  const d=await api("/api/ai/campaign",{method:"POST",body:JSON.stringify({goal})});
  if(supabaseClient&&supaUser){const {error}=await supabaseClient.from("campaigns").insert({user_id:supaUser.id,name:d.name,status:"Draft",objective:d.objective,data:d});if(error)throw error}
  loadCampaigns();toast("AI campaign draft created — review before launch")
 }catch(e){toast(e.message)}
}
$("#campaignAI").onclick=createCampaign;$("#newCampaign").onclick=createCampaign;

$("#creativeBtn").onclick=async()=>{
 try{const d=await api("/api/ai/creative",{method:"POST",body:JSON.stringify({product:$("#creativeProduct").value,angle:$("#creativeAngle").value,format:$("#creativeFormat").value})});
 $("#creativeResult").innerHTML=`<div class="card" style="margin-top:16px"><span class="tag blue">AI CONCEPT</span><h2>${d.title}</h2><p><b>Hook:</b> ${d.hook}</p><p><b>Layout:</b> ${d.layout.join(" → ")}</p><p>${d.meta}</p></div>`
 }catch(e){toast(e.message)}
};
$("#metaBtn").onclick=async()=>{try{const d=await api("/api/meta/connect");location.href=d.url}catch(e){toast(e.message)}};
async function loadMeta(){try{const d=await api("/api/meta/status");$("#metaStatus").textContent=d.configured?"Configured / review required":"Not configured"}catch{}}
$("#flowBtn").onclick=async()=>{
 try{
  if(supabaseClient&&supaUser){const {error}=await supabaseClient.from("automations").insert({user_id:supaUser.id,name:"New keyword flow",trigger_type:"COMMENT_KEYWORD",keyword:"INFO"});if(error)throw error}
  toast("Automation draft created")
 }catch(e){toast(e.message)}
};
$("#leadBtn").onclick=async()=>{
 const name=prompt("Lead name");if(!name)return;const phone=prompt("Phone");
 try{
  if(supabaseClient&&supaUser){const {error}=await supabaseClient.from("leads").insert({user_id:supaUser.id,name,phone,source:"Manual",score:50});if(error)throw error}
  $("#leadTable").insertAdjacentHTML("afterbegin",`<tr><td>${name}</td><td>Manual</td><td><span class="tag green">New</span></td><td>50</td><td>—</td></tr>`);toast("Lead added")
 }catch(e){toast(e.message)}
};

(async()=>{await initBackend();if(token)showApp()})();
