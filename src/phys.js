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
    constructor(x, y, r, c, w, vx, vy, b) {
        this.p={x,y}
        this.v={x:vx*(meterPixRatio/targetRate),y:vy*(meterPixRatio/targetRate)}
        this.pp=subVec(this.p, this.v)
        this.w=w
        this.c=c
        this.r=r
        this.b=b
        this.n=objs.length
        this.f=fixed.checked
    }
    phys(){
        if (!this.f){
            this.v=divVecCon(addVec(subVec(this.p, this.pp), this.a), 1)//fric)
            this.pp=this.p
            this.p=addVec(this.p, this.v)
            
            this.a={x:0,y:(meterPixRatio*9.8)/targetRate}
        }
    }
    surfTens(){

        if (this.tb.length){
            const sost = -0.2/this.tb.length
            this.tb.forEach(b=>{
                const an = norm(subVec(this.p, b))
                this.p = addVec(multVecCon(an,sost),this.p)
            })
        }
    }
    addForce(m, f){
        f = divVecCon(f, Math.max(10,this.w/m))
        this.a = addVec(this.a, f)
    }
    collline(l){
        const d = ( ((this.p.x-l.p1.x)*(l.p2.x-l.p1.x)) + ((this.p.y-l.p1.y)*(l.p2.y-l.p1.y)) ) / dist(l.p1, l.p2)**2;
        let cx = l.p1.x + (d * (l.p2.x-l.p1.x))
        let cy = l.p1.y + (d * (l.p2.y-l.p1.y))
        try{const os = linePoint(l.p1, l.p2, {x:cx,y:cy})
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
                    this.p = addVec(this.p, multVecCon(collNorm, -ad1*adjdist))
                    b.p = addVec(b.p, multVecCon(collNorm, ad2*adjdist))
                    
                    if (this.c[0]===0&&b.c[0]===0 && this.c[1]===76 && b.c[1]===76 && this.c[2]===255 && b.c[2]===255 && notInArray(this.tb, b.i)){
                        this.tb.push({x:b.p.x,y:b.p.y,i:b.i})
                        b.tb.push({x:this.p.x,y:this.p.y,i:this.i})
                    }
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
    objs.push(new Obj(x, y, r*meterPixRatio, c, w, vx*meterPixRatio, vy*meterPixRatio, b))
    
}
function addFan(x,y,speed,d,mp){
    fans.push({
        p:{x,y},
        s:speed,
        dir:d,
        md:dist({x,y},mp)
    })
}