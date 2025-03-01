class Obj {
    p
    pp
    v
    a={x:0,y:(meterPixRatio*9.8)/targetRate}
    c=[0,0,0]
    w=2**64
    r=10
    b=0.5
    n=0
    s=false
    f=false
    tb = []
    liquid= false
    surftens = 0
    constructor(x, y, r, c, w, vx, vy, b, l, st, f) {
        this.p={x,y}
        this.v={x:vx*(meterPixRatio/targetRate),y:vy*(meterPixRatio/targetRate)}
        this.pp=subVec(this.p, this.v)
        this.w=w
        this.c=c
        this.r=r
        this.b=b
        this.n=objs.length
        this.f=fixed.checked
        this.liquid = l
        this.surftens = st/this.w
    }
    phys(){
        if (!this.f){
            this.v=divVecCon(addVec(subVec(this.p, this.pp), this.a), 1)//fric)
            this.pp=this.p
            this.p=addVec(this.p, this.v)
            
            this.a={x:0,y:(meterPixRatio*grav)/targetRate}
        }
    }
    addForce(m, f){
        f = divVecCon(f, this.w*2*this.r/m)
        this.a = addVec(this.a, f)
    }
    surfTens(){
        /*if (this.liquid){
            let i = 0
            objs.forEach(o => {
                if (i !== this.i){
                    const d = dist(o.p, this.p)
                    if (d<=this.r+o.r && d!==0){
                        this.tb.push([o,d,i])
                    }
                }
                i++
            })
            this.tb.forEach(o => {
                
                const st = (this.surftens+o[0].surftens)*0.5
            })
            this.tb=[]
        }*/
    }
    collline(l){
        const sp1 = subVec(l.p1,l.m.p)
        const sp2 = subVec(l.p2, l.m.p)
        const x1 = sp1.x*Math.cos(l.m.t)-sp1.y*Math.sin(l.m.t)+l.m.p.x
        const y1 = sp1.x*Math.sin(l.m.t)+sp1.y*Math.cos(l.m.t)+l.m.p.y
        const x2 = sp2.x*Math.cos(l.m.t)-sp2.y*Math.sin(l.m.t)+l.m.p.x
        const y2 = sp2.x*Math.sin(l.m.t)+sp2.y*Math.cos(l.m.t)+l.m.p.y
        const v1 = {x:x1,y:y1}
        const v2 = {x:x2,y:y2}
        const d = ( ((this.p.x-x1)*(x2-x1)) + ((this.p.y-y1)*(y2-y1)) ) / dist(v1, v2)**2;
        let cx = x1 + (d * (x2-x1))
        let cy = y1 + (d * (y2-y1))
        try{const os = linePoint(v1, v2, {x:cx,y:cy})
        if (os !== "EE"){
            cx = os.x
            cy = os.y
        }}catch(e){alert(e)}
        const dis = dist({x:cx,y:cy},this.p)-l.w/2
        if (dis <= this.r){
            const N = norm(subVec(this.p, {x:cx,y:cy}))
            this.p = addVec(this.p, multVecCon(N, this.r-dis))
        }
    }
    collwall(){
        if (this.p.y>=innerHeight-this.r){
            this.p.y=innerHeight-this.r
            this.pp.y = this.p.y+this.v.y*this.b
        }
        if (this.p.x>=innerHeight-this.r){
            this.p.x=innerHeight-this.r
            this.pp.x = this.p.x+this.v.x*this.b
        }
        if (this.p.x<=this.r){
            this.p.x=this.r
            this.pp.x = this.p.x+this.v.x*this.b
        }
        lines.forEach(l => {
            this.collline(l)
        })
    }
    collideball(b){
        //ua+ab=va+vb
        //v' = (m1v1 + m2v2)/m1 + m2.
        const d = dist(this.p, b.p)
        if (d<this.r+b.r){
            if (d!==0){

                if (!this.f && !b.f){
                    const collNorm = norm(subVec(this.p, b.p))
                    const adjdist = d-(this.r+this.r)
                    //const adc = b.w/this.w
                    const mb = 1/(this.w+b.w)
                    const ad1 = (mb*b.w)
                    const ad2 = (mb*this.w)
                    const rmb = 1/(this.r+b.r)
                    const rm1 = rmb * this.r
                    const rm2 = rmb * b.r
                    this.p = addVec(this.p, multVecCon(collNorm, -ad1*rm1*adjdist))
                    b.p = addVec(b.p, multVecCon(collNorm, ad2*rm2*adjdist))
                    /*const vn = divVecCon(addVec(multVecCon(this.v, this.w), multVecCon(b.v, b.w)), this.w+b.w)

                    const cm = this.w+b.w
                    const tadj = b.w/cm
                    const oadj = this.w/cm
                    //alert(oadj)
                    this.a = addVec(this.a, multVecCon(vn, tadj))
                    b.a = addVec(b.a, multVecCon(vn, -oadj))*/
                }
                if (b.f && !this.f){
                    const mb = (this.r+b.r)/d
                    this.p = subVec(this.p, b.p)
                    this.p = multVecCon(this.p, mb)
                    this.p = addVec(this.p, b.p)
                }
            } else {
                this.a = addVec(this.a, {x:Math.random()-0.5, y: Math.random()-0.5})
            }
        }
    }
    collall(){
        
        for (let i = 0; i < objs.length; i++){
            if (i!==this.n){
                this.collideball(objs[i])
            }
        }

        valves.forEach(v =>{
            if (!v.o){
                const d = dist(this.p, v.p)
                if (d < this.r+v.r){
                    const mb = (this.r+v.r)/d
                    this.p = subVec(this.p, v.p)
                    this.p = multVecCon(this.p, mb)
                    this.p = addVec(this.p, v.p)
                }
            }
        })
    }
    draw(){
        if (this.s){
            ctx.strokeStyle = "blue"
            ctx.lineWidth = 2
        } else {
            ctx.strokeStyle = "black"
            ctx.lineWidth =1
        }
        ctx.fillStyle=`rgb(${this.c[0]},${this.c[1]},${this.c[2]})`
        ctx.beginPath()
        ctx.arc(this.p.x, this.p.y, this.r, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.fill()
    }
}
//const tobj = new Obj(400, 100, 10, [0,0,255], 10, 10, 0, 1)
function addObj(x,y,r,b,c,vx,vy,w){
    objs.push(new Obj(x, y, r*meterPixRatio, c, w, vx*meterPixRatio, vy*meterPixRatio, b, liq, parseFloat(stinp.value)*0.001))
}
function addFan(x,y,speed,d,mp){
    fans.push({
        p:{x,y},
        s:speed,
        dir:d,
        md:dist({x,y},mp)
    })
}