/**
 * Returns an element by its ID.
 * 
 * @param {String} id 
 * @returns {HTMLElement}
 */
function getEl(id){
    return document.getElementById(id)
}
/**
 * 
 * @param {String} id 
 * @returns {HTMLCanvasElement}
 */
function canv(id){
    return getEl(id)
}
const canvas = canv("canvas")
canvas.width=innerHeight
canvas.height=innerHeight
const multamount = (innerHeight-54)/innerHeight
const ma = 1/multamount
const offX=(innerWidth-innerHeight)/2+(innerHeight-innerHeight*multamount)/2

canvas.style.left=offX+"px"
canvas.style.width=innerHeight-54+"px"
canvas.style.height=innerHeight-54+"px"
const ctx = canvas.getContext("2d"),
      xinp = getEl("xinp"),
      yinp = getEl("yinp"),
      winp = getEl("winp"),
      cinp = getEl("cinp"),
      binp = getEl("binp"),
      vxinp = getEl("vxinp"),
      vyinp = getEl("vyinp"),
      abbtn = getEl("addballbtn"),
      rinp = getEl("rinp"),
      dinp = getEl("dinp"),
      presets = getEl("presets"),
      fpsEl = getEl("FPS"),
      autoc = getEl("autoc"),
      substeps = getEl("substeps"),
      selectbtn = getEl("selectbtn"),
      hidden = getEl("hidden"),
      rbbtn = getEl("remove"),
      clearbtn = getEl("clearbtn"),
      swi = getEl("swi"),
      acs = getEl("acs"),
      fixed = getEl("fixed"),
      albtn = getEl("albtn"),
      lwinp = getEl("lwinp"),
      clearufbtn= getEl("clearufbtn"),
      savelnk = getEl("savelnk"),
      savebtn = getEl("savebtn"),
      saveinp = getEl("saveinp"),
      ppbtn = getEl("ppbtn"),
      rstbtn = getEl("rstbtn"),
      lmenu = getEl("leftmenu"),
      rmenu = getEl("rightmenu"),
      avbtn = getEl("avbtn"),
      vninp = getEl("vninp"),
      ocvbtn = getEl("ocvbtn"),
      afbtn = getEl("afbtn"),
      fsinp = getEl("fsinp")
lmenu.style.width = offX+"px"
rmenu.style.width = offX+"px"
ctx.lineCap = "round"