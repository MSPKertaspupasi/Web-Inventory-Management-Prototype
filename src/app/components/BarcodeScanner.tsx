import { useRef } from "react"
import {
BrowserMultiFormatReader
}
from "@zxing/browser"

type Props={
onScan:(code:string)=>void
}

export default function BarcodeScanner({
onScan
}:Props){

const videoRef=
useRef<HTMLVideoElement>(null)

const start=
async()=>{

if(!videoRef.current)
return

const reader=
new BrowserMultiFormatReader()

try{

const result=
await reader
.decodeOnceFromVideoDevice(
undefined,
videoRef.current
)

onScan(
result.getText()
)

}
catch{

alert(
"Barcode tidak terbaca"
)

}

}

return(

<div className="space-y-3">

<button

type="button"

onClick={start}

className="
px-4
py-2
rounded
bg-green-600
text-white
"

>

Scan Barcode

</button>


<video

ref={videoRef}

autoPlay

className="
w-full
h-40
rounded-lg
bg-black
object-cover
"

/>

</div>

)

}