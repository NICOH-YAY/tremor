// The Doom status bar starts at row 168 of the 200-row display.
export function hintBounds(rect){const bottom=rect.top+rect.height*0.80;return {left:rect.left+rect.width*.04,top:rect.top+rect.height*.05,bottom,width:rect.width*.92};}
