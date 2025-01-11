
let a = 0
function run(){
    const ft = (thisLoop=Date.now()) - lastLoop
    frameTime+= (ft-frameTime)/filterS
    lastLoop = thisLoop
    pfps=fps
    fps=(1000/frameTime).toFixed(1)
    fpsEl.innerText=fps+" FPS"
    /*if (Math.round(fps/5)!==Math.round(pfps/5)){
        for (let i = 0; i < objs.length; i++){
            const mb = targetRate/fps
            const o = objs[i]
            o.vx = multVecCon(o.vx, mb)
            o.pp = subVec(o.p, o.vx)
        }
    }*/
    if (autoc.checked){
        if (a >= parseInt(acs.value)){
            for (let i = 0; i < parseInt(swi.value); i++){
                addObj(parseFloat(xinp.value)*meterPixRatio, parseFloat(yinp.value)*meterPixRatio+parseFloat(rinp.value)*8*i,
                parseFloat(rinp.value),parseFloat(binp.value),
                HEXRGB(cinp.value),parseFloat(vxinp.value),
                parseFloat(vyinp.value), parseFloat(winp.value))
            }
            a=0
        }
        a++
    }
    ctx.clearRect(0,0,innerHeight,innerHeight)

    objs.forEach(obj => {
        obj.draw()
        
        if (!paused){
            
            for (let i = 0; i < fans.length; i++){

                const f = fans[i]
                const p2 = addVec(f.p, f.dir)
                const d = ( ((obj.p.x-f.p.x)*(p2.x-f.p.x)) + ((obj.p.y-f.p.y)*(p2.y-f.p.y)) ) / dist(f.p, p2)**2;
                let cx = f.p.x + (d * (p2.x-f.p.x))
                let cy = f.p.y + (d * (p2.y-f.p.y))
                const dbcp = dist(obj.p, {x:cx,y:cy})
                const dfcp = dist(f.p, {x:cx,y:cy})
                if (dbcp <= 30 && dfcp <= f.md){
                    obj.addForce(10, multVecCon(f.dir,f.s*50/dbcp))
                }
            }
            obj.phys()
        }
    })

    ctx.strokeStyle="black"
    lines.forEach(l => {
        ctx.lineWidth = l.w
        ctx.beginPath()
        ctx.moveTo(l.p1.x,l.p1.y)
        ctx.lineTo(l.p2.x,l.p2.y)
        ctx.stroke()
        ctx.lineWidth = 1
    })
    ctx.fillStyle="gray"
    fans.forEach(f => {

        drawFan(f)
    })
    let i = 0
    valves.forEach(v =>{
        if (i===parseInt(vninp.value)){
            ctx.strokeStyle = "blue"
            ctx.lineWidth = 2
        } else {
            ctx.strokeStyle = "black"
            ctx.lineWidth =1
        }
        ctx.fillStyle=`rgba(${v.c[0]},${v.c[1]},${v.c[2]},${v.o?0:100})`
        ctx.beginPath()
        ctx.arc(v.p.x,v.p.y,v.r,0,2*Math.PI)
        ctx.fill()
        ctx.stroke()
        i++
    })
    for (let n = 0; n < parseInt(substeps.value); n++){
        for (let i = 0; i < objs.length; i++){
            const obj = objs[i]
            obj.collall()
            obj.collwall()
            obj.surfTens()
            obj.tb=[]
        }
    }
    if (ml && cn===1){
        const snapped = snapLines(mx, my)
        ctx.lineWidth = parseInt(lwinp.value)
        ctx.beginPath()
        ctx.moveTo(c1p.x,c1p.y)
        ctx.lineTo(snapped.x,snapped.y)
        ctx.stroke()
        ctx.lineWidth = 1
    }
}
setInterval(run, 1000/targetRate)
abbtn.addEventListener("click", ()=>{
    addObj(parseFloat(xinp.value)*meterPixRatio, parseFloat(yinp.value)*meterPixRatio,
    parseFloat(rinp.value),parseFloat(binp.value),
    HEXRGB(cinp.value),parseFloat(vxinp.value),
    parseFloat(vyinp.value), parseFloat(winp.value))
})
window.addEventListener("keypress", (e) => {
    switch (e.key){
        case "c":
            selecting = false
            av = false 
            af = false 
            ml = false
            cn=0
    }
})
canvas.addEventListener("contextmenu", (e)=>{
    e.preventDefault()
    xinp.value = mx/meterPixRatio
    yinp.value = my/meterPixRatio
})
canvas.addEventListener("mousedown", ()=>{
    clicking = true
})
canvas.addEventListener("mouseup", ()=>{
    clicking = false
})
canvas.addEventListener("mousemove", (e)=>{
    mx = (e.clientX-offX)*ma
    my =  e.clientY*ma
    if (clicking){

        const p = selectLinePoint(mx, my)

        p.forEach(point => {
            
            if (point.pn===0){
                lines[point.n].p1 = {x:mx,y:my}
            }
            if (point.pn===1){
                lines[point.n].p2 = {x:mx,y:my}
            }
        })
        if (!p.length){
            const sball = selectBall(mx, my)
            if (sball){
                const b = balls[sball]
                b.p.x=mx
                b.p.y=my
            }
        }
    }
})
canvas.addEventListener("click", (e)=>{
    if (e.clientX>offX&&e.clientX<innerWidth-offX){
        if (!selecting && !ml && !av && !af){
            addObj(mx,my,
            parseFloat(rinp.value),parseFloat(binp.value),
            HEXRGB(cinp.value),parseFloat(vxinp.value),
            parseFloat(vyinp.value), parseFloat(winp.value))
            return
        }
        if (selecting && !ml && !av && !af){
            const s = select(mx, my)
            if (s!==false){
                if (sil===false){
                    objs[s].s = true
                }
                selected=s
                hidden.style.display = "block"

    canvas.style.cursor="crosshair"
            }  
        }
        if (ml && !selecting && !av && !af){
            switch(cn){
                case 0:
                    
                    c1p = snapLines(mx, my)

                    cn++
                    break
                case 1:
                    c2p = snapLines(mx, my)
                    addLine(parseInt(lwinp.value))
            }
        }
        if (av && !selecting && !af && !ml){
            valves.push({p:{x:mx, y:my},r:parseFloat(rinp.value)*meterPixRatio,c:HEXRGB(cinp.value),o:false})
            vninp.max = valves.length-1
            av=false
        }
        if (af && !selecting && !av && !ml){
            switch(cn){
                case 0:
                    fp = {x:mx,y:my}
                    cn++
                    break
                case 1:
                    addFan(fp.x, fp.y, parseFloat(fsinp.value), norm(subVec({x:mx,y:my}, fp)), {x:mx,y:my})
                    cn=0
                    af=false
            }
        }
    }
})
rinp.addEventListener("change", ()=>{
    winp.value = (Math.PI*parseFloat(rinp.value)**2)*parseFloat(dinp.value)
})
dinp.addEventListener("change", ()=>{
    winp.value = (Math.PI*parseFloat(rinp.value)**2)*parseFloat(dinp.value)
})
presets.addEventListener("change", ()=>{
    switch(presets.value){
        case "sm":
            dinp.value=78.3
            cinp.value="#808080"
            binp.value=0.2
            break
        case "pla":
            dinp.value=12.5
            cinp.value="#F0F0F0"
            binp.value=0.8
            break
        case "fb":
            dinp.value=12.5
            cinp.value="#0080FF"
            binp.value=1
            break
        case "nb":
            dinp.value=12.5
            cinp.value="#FF6961"
            binp.value=0
            break
        case "w":
            dinp.value=9.98
            cinp.value="#004CFF"
            binp.value=0.05
            rinp.value=1
            vxinp.value=250
            vyinp.value=150
            acs.value=1
            break
        case "m":
            dinp.value=135.46
            cinp.value="#B7B8B9"
            binp.value=0.8
            break
        case "sf":
            dinp.value=0.35
            cinp.value="#F9F9F9"
            binp.value=0.1
    }
    winp.value = (Math.PI*parseFloat(rinp.value)**2)*parseFloat(dinp.value)
})
selectbtn.addEventListener("click", ()=>{
    if (selecting){
        selecting = false
        ball = null
        canvas.style.cursor = "crosshair"
    } else {
        selecting=true
        canvas.style.cursor = "grab"
    }

    selectbtn.style.backgroundColor = selecting ? "green" : "gray"
})
rbbtn.addEventListener("click", ()=>{
    if (!sil){
        objs.splice(selected, 1)
        for (let i = 0; i < objs.length; i++){
            if (i>=selected){
                objs[i].n--
            }
        }
    } else {
        lines.splice(selected, 1)
        for (let i = 0; i < lines.length; i++){
            if (i>=selected){
                lines[i].n--
            }
        }
    }
})
clearbtn.addEventListener("click", ()=>{
    objs=[]
    lines=[]
    valves=[]
    fans=[]
    cn=0
    ml =false
})
albtn.addEventListener("click", ()=>{
    ml = true
    canvas.style.cursor="crosshair"
})
clearufbtn.addEventListener("click", ()=>{
    let deleted = []
    let i = 0
    objs.forEach(obj =>{
        if (!obj.f){
            deleted.push(i)
        }
        i++
    })
    for (let d = deleted.length; d > 0; d--){
        objs.splice(deleted[d-1], 1)
    }
})

savebtn.addEventListener("click", ()=>{
    const save = {
        objs: objs,
        lines: lines,
        valves: valves
    }
    savelnk.href="data:text/json,"+JSON.stringify(save)
    savelnk.click()
})
ppbtn.addEventListener("click", ()=>{
    paused = paused ? false : true
    ppbtn.style.backgroundColor = paused ? "red" : "green"
})
rstbtn.addEventListener("click", ()=>{
    
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
})
avbtn.addEventListener("click", ()=>{
    av = true

    canvas.style.cursor="crosshair"
})
ocvbtn.addEventListener("click", ()=>{
    valves[parseInt(vninp.value)].o = valves[parseInt(vninp.value)].o ? false : true
})
afbtn.addEventListener("click", ()=>{
    af=true
})