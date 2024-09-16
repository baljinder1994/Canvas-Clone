import React, { useEffect, useState } from 'react'
import {SketchPicker} from 'react-color'
import {fabric} from 'fabric'
const App = () => {

  const[canvas,setCanvas]=useState(null)
  const[text,setText]=useState('')
  const[color,setColor]=useState('#000000')
  const[fontSize,setFontSize]=useState(20)
  const[isBold,setIsBold]=useState(false)
  const[fontFamily,setFontFamily]=useState('Arial')
  const[image,setImage]=useState(null)
  const[canvasSize,setCanvasSize]=useState({width:800,height:600})
  const[backgroundColor,setBackgroundColor]=useState('#ffffff')
  const[history,setHistory]=useState([])
  const[redoHistory,setRedoHistory]=useState([])
  const[opacity,setOpacity]=useState(1)

  useEffect(() =>{
    const initCanvas= new fabric.Canvas('canvas', {
      selection:false,
      width:canvasSize.width,
      height:canvasSize.height,
    })
    setCanvas(initCanvas)
    initCanvas.on('object:modified', saveCanvasState);
    return() =>{
      initCanvas.dispose()
    }
  },[canvasSize])

  useEffect(() =>{
    if(canvas){
      updateCanvasBackground()
    }
  },[backgroundColor])

  const updateCanvasBackground=()=>{
    if(!canvas) return;

    const existingBackground=canvas.getObjects().find((obj)=> obj.isBackground);

    if(existingBackground){
      existingBackground.set('fill',backgroundColor);
    }else{
      const background= new fabric.Rect({
        left:0,
        top:0,
        width:canvas.width,
        height:canvas.height,
        fill:backgroundColor,
        selectable:false,
        evented:false

      })
      background.isBackground=true;
      canvas.add(background)
      canvas.sendToBack(background)
    }
    canvas.renderAll()
  }


const updateCanvasSize=(width,height)=>{
  if(canvas){
    canvas.setWidth(width)
    canvas.setHeight(height)
    canvas.renderAll()
  }
}
  const saveCanvasState=()=>{
    setHistory((prevHistory) =>[...prevHistory,JSON.stringify(canvas)])
    setRedoHistory([])
  }

  const handleCanvasSizeChange=(e)=>{
    const [width,height] =e.target.value.split('x').map(Number)
    setCanvasSize({width,height})
    updateCanvasSize(width,height)
  }

  const handleBackgroundColorChange=(color)=>{
    setBackgroundColor(color.hex)
  }
  const addText=()=>{
     if(!canvas || !text) return;

     const newText=new fabric.Text(text,{
      left:100,
      top:100,
      fontFamily:fontFamily,
      fontSize:fontSize,
      fill:color,
      fontWeight:isBold ? 'bold': 'normal',
      opacity:opacity,
      editable:true,
      hasControls:true,
      hasBorders:true,
      lockScalingFlip:true
     })
     canvas.add(newText)
     canvas.setActiveObject(newText)
     canvas.renderAll()
     saveCanvasState()

  }
  const handleColorChange=(color)=>{
     setColor(color.hex)
     const activeObject=canvas.getActiveObject();

     if(activeObject){
      if(activeObject.type === 'text'){
        activeObject.set('fill',color.hex)
      }else if(['rect','circle'].includes(activeObject.type)){
        activeObject.set('fill',color.hex)
      }
      canvas.renderAll()
      saveCanvasState()
     }
  }
  const handleFontSizeChange=(e)=>{
    const newSize=parseInt(e.target.value,10)
    setFontSize(newSize)

    const activeObject=canvas.getActiveObject()
    if(activeObject && activeObject.type === 'text'){
      activeObject.set('fontSize',newSize)
      canvas.renderAll()
      saveCanvasState()
    }
  }
  const handleFontFamilyChange=(e)=>{
     const newFontFamily= e.target.value;
     setFontFamily(newFontFamily)

     const activeObject=canvas.getActiveObject();
     if(activeObject && activeObject.type === 'text'){
      activeObject.set('fontFamily',newFontFamily)
      canvas.renderAll()
      saveCanvasState()
     }
  }
  const toggleBold=()=>{
    setIsBold(!isBold);
    const activeObject= canvas.getActiveObject();
    if(activeObject && activeObject.type === 'text'){
      activeObject.set('fontWeight', isBold ? 'normal' : 'bold')
      canvas.renderAll()
      saveCanvasState()
    }
  }
  const handleOpacityChange=(e)=>{
     const newOpacity=parseFloat(e.target.value);
     setOpacity(newOpacity)
     const activeObject=canvas.getActiveObject()
     if(activeObject){
      activeObject.set('opacity',newOpacity)
      canvas.renderAll()
      saveCanvasState()
     }
  }
  const handleImageChange=(e)=>{
     setImage(e.target.files[0])
  }
  const addImage=()=>{
   if(!canvas || !image) return

   const reader=new FileReader();
   reader.onload=(e) =>{
    const imgElement=new Image();
    imgElement.src=e.target.result;
    imgElement.onload=() =>{
      const imgInstance= new fabric.Image(imgElement,{
        left:100,
        top:100,
        angle:0,
        opacity:opacity,
      })
      canvas.add(imgInstance);
      canvas.setActiveObject(imgInstance)
      canvas.renderAll();
      saveCanvasState()
    }
   
   }
   reader.readAsDataURL(image)
  }
  const addTectangle=()=>{
    const rect=new fabric.Rect({
      left:100,
      top:100,
      fill:color,
      width:100,
      height:100,
      opacity:opacity
    })
    canvas.add(rect)
    saveCanvasState()
  }
  
  const addCircle=()=>{
    const circle=new fabric.Circle({
      left:100,
      top:100,
      fill:color,
      radius:50,
      opacity:opacity
    })
    canvas.add(circle)
    saveCanvasState()
  }


  const deleteElement=()=>{
  const activeObject=canvas.getActiveObject();
  if(activeObject){
    canvas.remove(activeObject);
    canvas.renderAll()
    saveCanvasState()
  }
  }

  /*const toggleLock=()=>{
    if(canvas){
      canvas.getObjects().forEach((obj) =>{
        obj.set({
          lockMovementX:true,
          lockMovementY:true,
          lockRotation:true,
          lockScalingFlip:true,
          lockScalingX:true,
          lockScalingY:true,
          selectable:false,
          hasControls:false

        })
      })
      canvas.renderAll()
    }
    }
    */

    const toggleLock=() =>{
      const activeObject=canvas.getActiveObject();
      if(activeObject){
        activeObject.set({
          lockMovementX:!activeObject.lockMovementX,
          lockMovementY:!activeObject.lockMovementY,
        })
        canvas.renderAll()

      }
    }
  
  const redo=()=>{
    if(redoHistory.length === 0) return;

    const nextState=redoHistory[redoHistory.length - 1]
    setRedoHistory((prevRedo) => prevRedo.slice(0,-1))
    setHistory((prevHistory)=> [...prevHistory,JSON.stringify(canvas)])
    canvas.loadFromJSON(nextState, () => canvas.renderAll())
  }
  const undo=()=>{
    if(history.length === 0) return;
    setRedoHistory((prevRedo) => [...prevRedo,JSON.stringify(canvas)])
    const prevState=history[history.length - 1]
    setHistory((prevHistory) => prevHistory.slice(0,-1));
    canvas.loadFromJSON(prevState,() => canvas.renderAll())
  }
  const bringForward=()=>{
    const activeObject=canvas.getActiveObject();
    if(activeObject){
      canvas.bringForward(activeObject);
      canvas.renderAll()
    }
  }
  const sendBackward=()=>{
    const activeObject=canvas.getActiveObject();
    if(activeObject){
      canvas.sendBackwards(activeObject);
      canvas.renderAll()
    }
  }
  const downloadCanvasAsImage=()=>{
   if(!canvas) return

   const dataURL= canvas.toDataURL({
    format:'png',
    quality:1.0,

   })
   const link=document.createElement('a')
   link.href=dataURL;
   link.download='canvas-iamge.png'
   link.click()
  }












  return (
    <div className="thumbnail-creator">
        <div className='options-panel'>
          <h3>Options</h3>
          <div className='option'>
            <label>Canvas Size:</label>
            <select onChange={handleCanvasSizeChange} value={`${canvasSize.width}x${canvasSize.height}`}>
              <option value="800x600">800x600</option>
              <option value="400x124">400x124</option>
              <option value="180x720">180x720</option>
              <option value="120x80">120x80</option>
            </select>
          </div>
          <div className='option'>
            <label>Background Color:</label>
            <SketchPicker color={backgroundColor} onChangeComplete={handleBackgroundColorChange}></SketchPicker>
          </div>
          <div className='option'>
            <label>Text:</label>
            <input type="text" value={text} onChange={(e) =>setText(e.target.value)}></input>
            <button onClick={addText}>Add Text</button>
          </div>
          <div className='option'>
            <label>Text Color:</label>
            <SketchPicker color={color} onChangeComplete={handleColorChange}></SketchPicker>
          </div>
          <div className='option'>
            <label>Font Size:</label>
            <input type="number" value={fontSize} onChange={handleFontSizeChange}></input>
          </div>
          <div className='option'>
            <label>Font Family:</label>
            <select value={fontFamily} onChange={handleFontFamilyChange}>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="serif">serif</option>
              <option value="monospace">monospace</option>
              <option value="cursive">cursive</option>
              <option value="fantasy">fantasy</option>
            </select>
          </div>
          <div className='option'>
            <label>Bold:</label>
            <button onClick={toggleBold}>{isBold ? 'Unbold' : 'Bold'}</button>
          </div>
          <div className='option'>
           <label> Opacity:</label>
            <input type="range" min="0" max="1" step="0.1" value={opacity} onChange={handleOpacityChange}></input>
          </div>
          <div className='option'>
            <label>Upload Image:</label>
            <input type="file" onChange={handleImageChange}></input>
            <button onClick={addImage}>Add Image</button>
          </div>
          <div className='option'>
            <label>Shapes:</label>
            <button onClick={addTectangle}>Add Rectangle</button>
            <button onClick={addCircle}>Add Circle</button>
          </div>
          <div className='option'>
           <button onClick={deleteElement}>Delete Selected</button>
           <button onClick={toggleLock}>Lock/Unloack </button>
           <button onClick={bringForward}>Bring Forward </button>
           <button onClick={sendBackward}>Send Backward </button>
          </div>
          <div className='option'>
            <button onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
          </div>
          <div className='option'>
            <button onClick={downloadCanvasAsImage}>Download as Image</button>
          </div>
        </div>
        <div className='cnvas-container'>
          <canvas id="canvas"/>
        </div>
    </div>
  )
}

export default App
