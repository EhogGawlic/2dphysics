let meterPixRatio = innerHeight/500
let targetRate=250
const filterS = 10
let frameTime = 0, lastLoop = Date.now(), thisLoop, fps, pfps
let fric = 1.001
let objs = [],
    polys= []
let selecting = false
let selected
let lines = [],
    grav = 9.8,
    saved,
    cn = 0,
    c1p,
    c2p,
    ml = false,
    valves = [],
    cv = false,
    paused = false,
    sil = false,
    sobjs = [],
    slines=[],
    av=false,
    mx,
    my,
    mol = false,
    clicking=false,
    fans=[],
    af=false,
    fp = {x:0,y:0},
    infspace=false,
    liq = false,
    selecttype = "none",
    deleting=false,
    tcans=[],
    adding={ia:false,t:0}
const hRGBa = {"0":0,"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"a":10,"b":11,"c":12,"d":13,"e":14,"f":15}
const rHEXa = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]
function HEXRGB(from){
    let c = [0,0,0]
    c[0]=hRGBa[from.charAt(1)]*16
    c[0]+=hRGBa[from.charAt(2)]
    c[1]=hRGBa[from.charAt(3)]*16
    c[1]+=hRGBa[from.charAt(4)]
    c[2]=hRGBa[from.charAt(5)]*16
    c[2]+=hRGBa[from.charAt(6)]
    
    return c
}
function imgSrc(url){
    const srcimg = document.createElement("img")
    srcimg.src=url
    srcimg.style.display="none"
    return srcimg
}
function selectBall(x, y){
    for (let i = 0; i < objs.length; i++){
        if (dist({x, y}, objs[i].p) <= objs[i].r){
            return i
        }
    }
    return undefined 
    
}
function selectValve(x, y){
    for (let i = 0; i < valves.length; i++){
        if (dist({x, y}, valves[i].p) <= valves[i].r){
            return i
        }
    }
    return undefined 
    
}
function selectFan(x, y){
    for (let i = 0; i < fans.length; i++){
        if (dist({x, y}, fans[i].p) <= 20){
            return i
        }
    }
    return undefined
    
}
function selectTCan(x, y){
    for (let i = 0; i < tcans.length; i++){
        if (dist({x, y}, tcans[i]) <= 64){
            return i
        }
    }
    return undefined
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function addLine(w){
    lines.push({p1:c1p,p2:c2p,w:w, m:{h:false,p:{x:0,y:0},t:0},np1:c1p,np2:c2p,s:0.05})
    lninp.max=lines.length-1
    cn=0
    ml =false
}
function processFiles(files) {
    const file = files[0];

    const reader = new FileReader()
    reader.onload = function (e) {
      // parse string to json
        saved = JSON.parse(e.target.result);
        objs=[]
        lines=[]
        valves=[]
        cn=0
        ml =false
        for (let i = 0; i < saved.objs.length; i++){
            const o = saved.objs[i]
            objs.push(new Obj(o.x, o.y, o.r, o.c, o.w, o.vx, o.vy, o.b, o.liquid, o.surftens))
            objs[i].f = o.f
        }
        for (let i = 0; i < saved.valves.length; i++){
            const o = saved.valves[i]
            valves.push({p:o.p,r:o.r,c:o.c,o:o.o})
        }
        lines = saved.lines
        fans = saved.fans
        tcans = saved.tcans
    }
    reader.readAsText(file)
}

function dist(v1, v2){
    return Math.sqrt((v1.x-v2.x)**2+(v1.y-v2.y)**2)
}

function linePoint(p1, p2, p) {

    // get distance from the point to the two ends of the line
    const d1 = dist(p, p1);
    const d2 = dist(p, p2);
  
    // get the length of the line
    const lineLen = dist(p1, p2);
  
    // since floats are so minutely accurate, add
    // a little buffer zone that will give collision
    const b = 0.1;    // higher # = less accurate
  
    // if the two distances are equal to the line's
    // length, the point is on the line!
    // note we use the buffer here to give a range,
    // rather than one #
    if (d1+d2 >= lineLen-b && d1+d2 <= lineLen+b) {
        return "EE"
    }
    if (d1<=d2){
        return p1
    } else {
        return p2
    }
}
function snapLines(x, y){
    //if(slines.checked){
        let snapx = x
        let snapy = y
        lines.forEach(line =>{

            let npl = linePoint(line.p1, line.p2, {x,y})
            if (npl === "EE"){

                
                const d = ( ((x-line.p1.x)*(line.p2.x-line.p1.x)) + ((y-line.p1.y)*(line.p2.y-line.p1.y)) ) / dist(line.p1, line.p2)**2;
                let cx = line.p1.x + (d * (line.p2.x-line.p1.x))
                let cy = line.p1.y + (d * (line.p2.y-line.p1.y))
                npl = {x:cx,y:cy}
            }
            if (dist(npl, {x,y}) <= Math.max(line.w/2, 10)){

                snapx = npl.x
                snapy = npl.y
            }
            if (dist(line.p1, {x,y})<=Math.max(line.w/2, 20)){
                snapx = line.p1.x
                snapy = line.p1.y
            }
            if (dist(line.p2, {x,y})<=Math.max(line.w/2, 20)){
                snapx = line.p2.x
                snapy = line.p2.y
            }
        })
        return {x:snapx,y:snapy}
    //}else{return{x,y}}
}
function selectLine(x, y){
    let i = 0
    lines.forEach(line =>{
        let npl = linePoint(line.p1, line.p2, {x,y})
        if (npl === "EE"){

            const d = ( ((x-line.p1.x)*(line.p2.x-line.p1.x)) + ((y-line.p1.y)*(line.p2.y-line.p1.y)) ) / dist(line.p1, line.p2)**2;
            let cx = line.p1.x + (d * (line.p2.x-line.p1.x))
            let cy = line.p1.y + (d * (line.p2.y-line.p1.y))
            npl = {x:cx,y:cy}
        }
        if (dist(npl, {x,y}) <= Math.max(line.w, 10)){
            return i
        }
        i++
    })
    return undefined
}
function select(x, y){
    const bs = selectBall(x, y)
    const ls = selectLine(x, y)
    if (bs!==undefined){
        sil = false
        return bs
    }
    if (ls!==undefined){
        if (bs===undefined){
            sil = true
            return ls
        } else {
            sil = false
            return bs
        }
    }
    return false
}
function selectLinePoint(x,y){
    let i = 0
    let ns = []
    lines.forEach(l => {
        if (dist(l.p1, {x,y})<=Math.max(l.w, 10)){
            ns.push({n:i,pn:0})
        }
        if (dist(l.p2, {x,y})<=Math.max(l.w, 10)){
            ns.push({n:i,pn:1})
        }
        i++
    })
    return ns
}
const getAngle = function(v){
    return Math.atan2(v.y,v.x)
}
function drawImage(image, x, y, scale, rotation){
    ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
    ctx.rotate(rotation);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.setTransform(1,0,0,1,0,0)
} 
function drawFan(fan){
    const a = getAngle(fan.dir)+1.57079633
    drawImage(t%2===0?fan1:fan2,fan.p.x,fan.p.y,40/(innerHeight-52),a)
    
}
function notInArray(ar,n){
    for (let i = 0; i < ar.length; i++){
        if (ar[i]===n){
            return false
        }
    }
    return true
}
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
///
/// Compressed saves
///
function encode(){
    let str = ``
    lines.forEach(l=>{

        str += `${l.p1.x},${l.p1.y},${l.p2.x},${l.p2.y},${l.w},${l.m.h?"t":"f"},${l.m.p.x},${l.m.p.y},${l.m.t},${l.m.s}n`
    })
    
    str+=";"
    fans.forEach(f=>{
        str += `${f.p.x},${f.p.y},${f.s},${f.dir.x},${f.dir.y},${f.md}n`
    })
    
    str+=";"
    valves.forEach(v=>{
        str += `${v.p.x},${v.p.y},${v.r},${v.c[0]},${v.c[1]},${v.c[2]},${v.o?"t":"f"}n`
    })
    str+=";"
    tcans.forEach(t=>{
        str += `${t.x},${t.y}n`
    })
    return str
}
const pf = parseFloat
function decode(str){
    objs=[]
    lines=[]
    valves=[]
    fans=[]
    tcans=[]
    cn=0
    ml =false
    deleting=false
    adding.ia=false
        const things = str.split(";")

        const ls = things[0].split("n")
        for (let i = 0; i < ls.length-1; i++){

            
            const parts = ls[i].split(",")
            const p1 = v(pf(parts[0]),pf(parts[1]))
            const p2 = v(pf(parts[2]),pf(parts[3]))
            const mp = v(pf(parts[6]),pf(parts[7]))
            lines.push({p1,p2,w:pf(parts[4]), m:{h:parts[5]==="t",p:mp,t:pf(parts[8]),s:pf(parts[9])},np1:p1,np2:p2,s:pf(parts[9])})
            lninp.max=lines.length-1
        }
        const fs = things[1].split("n")
        for (let i = 0; i < fs.length-1; i++){
            const parts = fs[i].split(",")
            //psdirmd
            
            fans.push({
                p: v(pf(parts[0]),pf(parts[1])),
                s: pf(parts[2]),
                dir: v(pf(parts[3]),pf(parts[4])),
                md:pf(parts[5])
            })
        }
        const vs = things[2].split("n")
        for (let i = 0; i < vs.length-1; i++){
            const parts = vs[i].split(",")
            //prco
            valves.push({
                p:v(pf(parts[0]),pf(parts[1])),
                r:pf(parts[2]),
                c:[pf(parts[3]),pf(parts[4]),pf(parts[5])],
                o:parts[6]==="t"
            })
        }
        const ts = things[3].split("n")
        for (let i = 0; i < ts.length-1; i++){
            const parts = ts[i].split(",")
            //prco
            tcans.push({
                x:pf(parts[0]),
                y:pf(parts[1])
            })
        }
}

String.prototype.removeCharAt = function (i) {
    var tmp = this.split(''); // convert to an array
    tmp.splice(i - 1 , 1); // remove 1 element from the array (adjusting for non-zero-indexed counts)
    return tmp.join(''); // reconstruct the string
}
function saveData(data, name) {
    if(localStorage.getItem(name) !== null){
        localStorage.clear()
        localStorage.setItem(name, data);
    }
    else{
        localStorage.setItem(name, data);
    }
}
function getStorage(name){
    if(localStorage.getItem(name) !== null){
        return localStorage.getItem(name)
    }
}