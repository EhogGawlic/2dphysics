const meterPixRatio = innerHeight/500
let targetRate=250
const filterS = 10
let frameTime = 0, lastLoop = Date.now(), thisLoop, fps, pfps
let fric = 1.001
let objs = []
let selecting = false
let selected
let lines = [],
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
    fp = {x:0,y:0}
const hRGBa = {"0":0,"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"a":10,"b":11,"c":12,"d":13,"e":14,"f":15}
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
function selectBall(x, y){
    for (let i = 0; i < objs.length; i++){
        if (dist({x, y}, objs[i].p) <= objs[i].r){
            return i
        }
    }
    return undefined 
    
}

function addLine(w){
    lines.push({p1:c1p,p2:c2p,w:w})
    
    cn=0
    ml =false
}
function processFiles(files) {
    const file = files[0];

    const reader = new FileReader()
    reader.onload = function (e) {
      // parse string to json
        const saved = JSON.parse(e.target.result);
        objs=[]
        lines=[]
        valves=[]
        cn=0
        ml =false
        for (let i = 0; i < saved.objs.length; i++){
            const o = saved.objs[i]
            addObj(o.p.x,o.p.y,o.r/meterPixRatio,o.b,o.c,o.v.x/meterPixRatio,o.v.y/meterPixRatio,o.v.w)
            objs[i].f = o.f
        }
        for (let i = 0; i < saved.valves.length; i++){
            const o = saved.valves[i]
            valves.push({p:o.p,r:o.r,c:o.c,o:o.o})
        }
        lines = saved.lines
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
        if (dist(npl, {x,y}) <= Math.max(line.w, 10)){

            snapx = npl.x
            snapy = npl.y
        }
        if (dist(line.p1, {x,y})<=Math.max(line.w, 20)){
            snapx = line.p1.x
            snapy = line.p1.y
        }
        if (dist(line.p2, {x,y})<=Math.max(line.w, 20)){
            snapx = line.p2.x
            snapy = line.p2.y
        }
    })
    return {x:snapx,y:snapy}
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
function drawFan(fan){
    ctx.beginPath()
    ctx.arc(fan.p.x,fan.p.y, 30, 0, 360)
    ctx.fill()
    ctx.stroke()
    try{
    ctx.strokeStyle = "rgba(1,1,1,50)"
    ctx.moveTo(fan.p.x,fan.p.y)
    const np = addVec(fan.p, multVecCon(fan.dir,100))
    ctx.lineTo(np.x, np.y)
    ctx.stroke()
    }catch(e){alert(e)}
}
function notInArray(ar,n){
    for (let i = 0; i < ar.length; i++){
        if (ar[i]===n){
            return false
        }
    }
    return true
}