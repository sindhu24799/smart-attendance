const video = document.getElementById("video")

navigator.mediaDevices.getUserMedia({
video:true
})
.then(stream=>{
video.srcObject = stream
})


function capture(){

let canvas = document.createElement("canvas")

canvas.width = video.videoWidth
canvas.height = video.videoHeight

canvas.getContext("2d")
.drawImage(video,0,0)

canvas.toBlob(blob=>{

let form = new FormData()

form.append("image", blob)

fetch("http://127.0.0.1:5000/verify",{
method:"POST",
body:form
})

})

}
document.addEventListener(
"visibilitychange",
function(){

if(document.hidden){

fetch("/log_event",{
method:"POST",
body:JSON.stringify({
event:"tab switched"
})
})

}

})