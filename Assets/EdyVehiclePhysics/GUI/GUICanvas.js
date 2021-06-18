//========================================================================================================================
// Edy Vehicle Physics - (c) Angel Garcia "Edy" - Oviedo, Spain
// Live demo: http://www.edy.es/unity/offroader.html
// 
// Terms & Conditions:
//  - Use for unlimited time, any number of projects, royalty-free.
//  - Keep the copyright notices on top of the source files.
//  - Resale or redistribute as anything except a final product to the end user (asset / library / engine / middleware / etc.) is not allowed.
//  - Put me (Angel Garcia "Edy") in your game's credits as author of the vehicle physics.
//
// Bug reports, improvements to the code, suggestions on further developments, etc are always welcome.
// Unity forum user: Edy
//========================================================================================================================
//
// GUICanvas
//
// Standalone class (not derived from MonoBehavior) for common GUI drawing operations.
//
//========================================================================================================================

#pragma strict


class GUICanvas
	{
	private var m_texture : Texture2D;
	private var m_pixelsWd : float;
	private var m_pixelsHt : float;
	private var m_canvasWd : float;
	private var m_canvasHt : float;
	private var m_canvasX0 : float;
	private var m_canvasY0 : float;
	private var m_scaleX : float;
	private var m_scaleY : float;
	
	private var m_moveX : float;
	private var m_moveY : float;
	
	private var m_pixels : Color32[];
	private var m_buffer : Color32[];
	
	private var m_alpha = -1.0;
	private var m_changed = false;
	
	// Constructores e información
	
	private function InitCanvas (pixelsWd : int, pixelsHt : int, canvasX0 : float, canvasY0 : float, canvasWd : float, canvasHt : float)	
		{
		m_texture = new Texture2D(pixelsWd, pixelsHt, TextureFormat.ARGB32, false);
		m_pixelsWd = pixelsWd;
		m_pixelsHt = pixelsHt;
		
		m_moveX = 0.0;
		m_moveY = 0.0;
		
		m_pixels = new Color32[pixelsWd * pixelsHt];
		
		ResizeCanvas(canvasX0, canvasY0, canvasWd, canvasHt);
		}
		
	function GUICanvas (pixelsWd : int, pixelsHt : int, canvasX0 : float, canvasY0 : float, canvasWd : float, canvasHt : float)
		{
		InitCanvas (pixelsWd, pixelsHt, canvasX0, canvasY0, canvasWd, canvasHt);
		}
		
	function GUICanvas (pixelsWd : int, pixelsHt : int, canvasWd : float, canvasHt : float)
		{
		InitCanvas (pixelsWd, pixelsHt, 0.0, 0.0, canvasWd, canvasHt);
		}
	
	
	function ResizeCanvas (canvasX0 : float, canvasY0 : float, canvasWd : float, canvasHt : float)	
		{
		m_scaleX = m_pixelsWd / canvasWd;
		m_scaleY = m_pixelsHt / canvasHt;
		m_canvasX0 = canvasX0;
		m_canvasY0 = canvasY0;
		m_canvasWd = canvasWd;
		m_canvasHt = canvasHt;
		}
	
	function CanvasWidth () : float { return m_canvasWd; }
	function CanvasHeight () : float { return m_canvasHt; }
	function PixelsWidth () : float { return m_pixelsWd; }
	function PixelsHeight () : float { return m_pixelsHt; }
	function ScaleX () : float	{ return m_scaleX; }
	function ScaleY () : float	{ return m_scaleY; }
	
	// Destructor - necesario al usar GUICanvas desde el Editor, para evitar dejar Texture2D sin referenciar.
	
	function DestroyTexture ()
		{
		UnityEngine.Object.DestroyImmediate(m_texture);
		}
		
	// Establecer automáticamente la transparencia. Indicar -1 para que se use siempre la del color indicado.
	
	function SetAlpha (alpha : float)
		{
		m_alpha = alpha;
		}
		
	// Dibujar Lineas
	
	function Line (x0 : float, y0 : float, x1 : float, y1 : float, col : Color32)
		{
		MoveTo(x0, y0);
		LineTo(x1, y1, col);
		}
		
	function MoveTo (x0 : float, y0 : float)
		{
		m_moveX = x0;
		m_moveY = y0;
		}
		
	function LineTo (xn : float, yn : float, col : Color32)
		{
		if (m_alpha >= 0) col.a = Mathf.Clamp01(m_alpha) * 255;
		
		var x0 = m_moveX - m_canvasX0;
		var y0 = m_moveY - m_canvasY0;
		var x1 = xn - m_canvasX0;
		var y1 = yn - m_canvasY0;
		
		m_moveX = xn;
		m_moveY = yn;		
		
		// Asegurar que x0 <= x1. Así organizamos mejor el crop.
		
		if (x0 > x1)
			{
			var tmp = x0; x0 = x1; x1 = tmp;
			tmp = y0; y0 = y1; y1 = tmp;
			}
			
		// Cropear por izquierda y derecha
		
		var sl = (y1-y0)/(x1-x0);
		
		if (x0 < 0.0) { y0 = y0 - x0 * sl; x0 = 0.0; }
		if (x1 > m_canvasWd) { y1 = y1 - (x1-m_canvasWd) * sl; x1 = m_canvasWd; }
		
		// Ya podemos descartar las lineas que no cruzarán el cuadro
			
		if (x0 > m_canvasWd || x1 < 0.0 || 
			(y0 < 0.0 && y1 < 0.0) || (y0 > m_canvasHt && y1 > m_canvasHt))
			return;
			
		// Si llega aquí la linea cruza el cuadro necesariamente. Ya tenemos las "X" cropeadas.
		// Ajustar las coordenadas "Y" que pudieran estar fuera.
		
		if (y0 < 0.0) { x0 = x0 - y0 / sl; y0 = 0.0; }
		if (y0 > m_canvasHt) { x0 = x0 - (y0-m_canvasHt) / sl; y0 = m_canvasHt; }

		if (y1 < 0.0) { x1 = x1 - y1 / sl; y1 = 0.0; }
		if (y1 > m_canvasHt) { x1 = x1 - (y1-m_canvasHt) / sl; y1 = m_canvasHt; }

		// Dibujar la linea

		TexLine(x0*m_scaleX, y0*m_scaleY, x1*m_scaleX, y1*m_scaleY, col);
		m_changed = true;
		}
	
	// Lineas con Vector2
		
	function Line (P0 : Vector2, P1 : Vector2, col : Color32)
		{
		MoveTo(P0.x, P0.y);
		LineTo(P1.x, P1.y, col);
		}
		
	function MoveTo (P0 : Vector2)
		{
		MoveTo(P0.x, P0.y);
		}
		
	function LineTo (P1 : Vector2, col : Color32)
		{
		LineTo(P1.x, P1.y, col);
		}

	// Lineas horizontales / verticales
	
	function LineH (y : float, col : Color32)
		{
		Line(m_canvasX0, y, m_canvasX0+m_canvasWd, y, col);
		}
		
	function LineV (x : float, col : Color32)
		{
		Line(x, m_canvasY0, x, m_canvasY0+m_canvasHt, col);
		}
		
	// Dibujar círculo. El radio se mide en la escala X.
	
	function Circle (x : float, y : float, radius : float, col : Color32)
		{
		if (m_alpha >= 0) col.a = Mathf.Clamp01(m_alpha) * 255;
		TexCircle((x-m_canvasX0)*m_scaleX, (y-m_canvasY0)*m_scaleY, radius*m_scaleX, col);
		m_changed = true;
		}
		
	// Rellenar bloques
	
	function Clear (col : Color32)
		{
		var count = m_pixelsWd * m_pixelsHt;
		
		if (m_alpha >= 0) col.a = Mathf.Clamp01(m_alpha) * 255;
		for (var i=0; i<count; i++)
			m_pixels[i] = col;
			
		m_changed = true;
		}
		
	function Fill (x : float, y : float, width : float, height : float, col : Color32)
		{
		var x0 : int = (x-m_canvasX0)*m_scaleX;
		var y0 : int = (y-m_canvasY0)*m_scaleY;
		var x1 : int = x0 + width*m_scaleX;
		var y1 : int = y0 + height*m_scaleY;
		
		if (x1 <= x0 || y1 <= y0) return;
		if (m_alpha >= 0) col.a = Mathf.Clamp01(m_alpha) * 255;
		
		for (var j=y0; j<y1; j++)
			for (var i=x0; i<x1; i++)
				TexSetPixel(i, j, col);
				
		m_changed = true;
		}
		
	// Dibujar spline
	
	function SpLine (P0 : Vector2, T0 : Vector2, P1 : Vector2, T1 : Vector2, col : Color32)
		{
		SpLine (P0, T0, P1, T1, col, 20);
		}		
		
	function SpLine (P0 : Vector2, T0 : Vector2, P1 : Vector2, T1 : Vector2, col : Color32, steps : int)
		{
		SpLine (P0, T0, P1, T1, col, steps, 1.0);
		}		
		
	function SpLine (P0 : Vector2, T0 : Vector2, P1 : Vector2, T1 : Vector2, col : Color32, steps : int, scaleY : float)
		{
		var s : float;
		var s2 : float;
		var s3 : float;
		var h1 : float;
		var h2 : float;
		var h3 : float;
		var h4 : float;
		var P : Vector2;
		
		MoveTo(P0.x, P0.y * scaleY);
		for (var t=0; t<=steps; t++)
			{
			s = t;
			s /= steps;
			s2 = s*s;
			s3 = s2*s;
			
			// Valores de las funciones de Hermite
			
			h1 =  2*s3 - 3*s2 + 1;
			h2 = -2*s3 + 3*s2;
			h3 =    s3 - 2*s2 + s;
			h4 =    s3 - s2;
			
			/* Estas son las ecuaciones para curvas de Bezier - yo no he notado absolutamente ninguna diferencia.
			h1 =   -s3 + 3*s2 - 3*s + 1;
			h2 =  3*s3 - 6*s2 + 3*s;
			h3 = -3*s3 + 3*s2;
			h4 =    s3;
			*/
			
			// Punto interpolado
			
			P = h1*P0 + h2*P1 + h3*T0 + h4*T1;
			LineTo(P.x, P.y * scaleY, col);
			}
		}
			
	// Especializadas
	// -----------------------------------------------------------

	// Dibujar una rejilla a intervalos dados
	
	function Grid (stepX : float, stepY : float, col : Color32)
		{
		var f : float;
		
		var x0 = Mathf.FloorToInt(m_canvasX0 / stepX) * stepX;
		var y0 = Mathf.FloorToInt(m_canvasY0 / stepY) * stepY;
		
		for (f=x0; f<=m_canvasX0+m_canvasWd; f+=stepX) LineV(f, col);
		for (f=y0; f<=m_canvasY0+m_canvasHt; f+=stepY) LineH(f, col);
		}

	
	// Dibujar una curva de fricción de WheelCollider
	
	function FrictionCurve (Slip0 : float, Value0 : float, Slip1 : float, Value1 : float, Slope : float, col : Color)
		{
		var P0 = new Vector2(Slip0, Value0);
		var P1 = new Vector2(Slip1, Value1);
		var sl0 = Value0/Slip0;
		var sl1 = Value1/Slip1;
		
		SpLine(Vector2.zero, Vector2(Slip0, 0), P0, P0,	col);		
		SpLine(P0, 
				Vector2(Slip1-Slip0, sl0*Slip1 - Value0) * (1 + (Slip1-Slip0) / (Slip1-Slip0+1)) * CarWheelFriction.MCt0,
				P1, 
				Vector2(Slip1-Slip0, 0) * CarWheelFriction.MCt1,			
				col);
		Line(Slip1, Value1, m_canvasWd, Value1 + (m_canvasWd-Slip1)*Slope, col);
		}
		
	// Dibujar una curva progresiva (Bias) entre dos puntos con el coeficiente dado
	
	function BiasCurve (P0 : Vector2, P1 : Vector2, bias : float, col : Color32)
		{
		var Steps = 20;
		
		var s : float;
		var c : float;
		
		var dX = P1.x - P0.x;
		var dY = P1.y - P0.y;
		
		MoveTo(P0);
		for (var t=0; t<=Steps; t++)
			{
			s = t;
			s /= Steps;			
			c = Bias(s, bias);
			
			LineTo(P0.x + dX*s, P0.y + dY*c, col);
			}
		}
		
	
	// Gráfica de lineas con los valores dados.
	// - Para una sola gráfica Values debe llevar pares consecutivos X,Y con ValueSize=2  (número total de valores en cada conjunto)
	// - Para n gráficas indicar valores consecutivos X,Y1,Y2,Y3..Yn con ValueSize=n+1
	//   Se dibujarán las gráficas (X,Y1), (X,Y2), (X,Y3) .. (X,Yn)
	
	private var COLORS = [Color.green, Color.yellow, Color.cyan, Color.magenta, Color.white, Color.blue, Color.red, Color.gray];
	
	function LineGraph (Values : float[], ValueSize : int)
		{
		var X : float;
		var Y : float;
		
		if (ValueSize < 2) return;
		if (Values.length < 2*ValueSize) return;

		for (var i=1; i<ValueSize; i++)
			{
			MoveTo(Values[0], Values[i]);
			
			for (var v=1; v<Values.length/ValueSize; v++)
				LineTo(Values[v*ValueSize], Values[v*ValueSize + i], COLORS[(i-1) % 8]);
			}
		}


	// Función y=f(x) entre los valores de x dados
	
	function Function(func : function(float) : float, x0 : float, x1 : float, col : Color32, stepSize : float, scaleY : float)
		{
		MoveTo(x0, func(x0) * scaleY);
		
		for (var x=x0; x<=x1; x+=stepSize)
			LineTo(x, func(x) * scaleY, col);
			
		if (x < x1)
			LineTo(x1, func(x1) * scaleY, col);
		}
		
	function Function(func : function(float) : float, x0 : float, x1 : float, col : Color32, stepSize : float)
		{
		this.Function(func, x0, x1, col, stepSize, 1.0);
		}
		
	function Function(func : function(float) : float, x0 : float, x1 : float, col : Color32)
		{
		this.Function(func, x0, x1, col, 0.1, 1.0);
		}
		
		
	// Función y=f(x, p) siendo p un parámetro fijo que se pasa a la función	
	
	function Function2(func : function(float, float) : float, p : float, x0 : float, x1 : float, col : Color32, stepSize : float, scaleY : float)
		{
		MoveTo(x0, func(x0, p) * scaleY);
		
		for (var x=x0; x<=x1; x+=stepSize)
			LineTo(x, func(x, p) * scaleY, col);
			
		if (x < x1)
			LineTo(x1, func(x1, p) * scaleY, col);
		}
		
	function Function2(func : function(float, float) : float, p : float, x0 : float, x1 : float, col : Color32, stepSize : float)
		{
		this.Function2(func, p, x0, x1, col, stepSize, 1.0);
		}
	
	function Function2(func : function(float, float) : float, p : float, x0 : float, x1 : float, col : Color32)
		{
		this.Function2(func, p, x0, x1, col, 0.1, 1.0);
		}

		
	// Función y=f(x, p, q) siendo p y q dos parámetros fijos que se pasan a la función	
	
	function Function3(func : function(float, float, float) : float, p : float, q : float, x0 : float, x1 : float, col : Color32, stepSize : float, scaleY : float)
		{
		MoveTo(x0, func(x0, p, q) * scaleY);
		
		for (var x=x0; x<=x1; x+=stepSize)
			LineTo(x, func(x, p, q) * scaleY, col);
			
		if (x < x1)
			LineTo(x1, func(x1, p, q) * scaleY, col);
		}		

	function Function3(func : function(float, float, float) : float, p : float, q : float, x0 : float, x1 : float, col : Color32, stepSize : float)
		{
		this.Function3(func, p, q, x0, x1, col, stepSize, 1.0);
		}
	
	function Function3(func : function(float, float, float) : float, p : float, q : float, x0 : float, x1 : float, col : Color32)
		{
		this.Function3(func, p, q, x0, x1, col, 0.1, 1.0);
		}
		
		
	// Guardar / Restaurar
	// -----------------------------------------------------------

	function Save ()
		{
		if (m_buffer == null)
			m_buffer = m_pixels.Clone() as Color32[];
		else
			m_pixels.CopyTo(m_buffer, 0);
		}
		
	function Restore ()
		{
		if (m_buffer)
			{
			m_buffer.CopyTo(m_pixels, 0);
			m_changed = true;
			}
		}
	
	// Dibujar en el GUI. Invocar sólo desde función OnGUI
	// -----------------------------------------------------------
	
	function ApplyChanges()
		{
		if (m_changed)
			{
			m_texture.SetPixels32(m_pixels);			
			m_texture.Apply(false);
			m_changed = false;
			}
		}
	
	function GUIDraw (posX : int, posY : int)
		{
		ApplyChanges();
		GUI.DrawTexture(Rect(posX, posY, m_pixelsWd, m_pixelsHt), m_texture);
		}
		
	function GUIStretchDraw(posX : int, posY : int, width : int, height : int)
		{
		ApplyChanges();
		GUI.DrawTexture(Rect(posX, posY, width, height), m_texture);
		}
		
	function GUIStretchDrawWidth(posX : int, posY : int, width : int)
		{
		ApplyChanges();
		var ratio = m_pixelsHt / m_pixelsWd;
		GUI.DrawTexture(Rect(posX, posY, width, width * ratio), m_texture);
		}
		
	function GetTexture() : Texture
		{
		ApplyChanges();
		return m_texture;
		}
	}


// ----------- función de curva progresiva (Bias)

private var m_lastExponent = 0.0;
private var m_lastBias = -1.0;

private function BiasRaw(x : float, fBias : float) : float
	{
	if (x <= 0.0) return 0.0;
	if (x >= 1.0) return 1.0;

	if (fBias != m_lastBias)
		{
		if (fBias <= 0.0) return x >= 1.0? 1.0 : 0.0;
		else if (fBias >= 1.0) return x > 0.0? 1.0 : 0.0;
		else if (fBias == 0.5) return x;

		m_lastExponent = Mathf.Log(fBias) * -1.4427;
		m_lastBias = fBias;
		}

	return Mathf.Pow(x, m_lastExponent);
	}

	
// Bias simétrico usando sólo la curva inferior (fBias < 0.5)
// Admite rango -1, 1 aplicando efecto simétrico desde 0 hacia +1 y -1.

private function Bias(x : float, fBias : float) : float
	{
	var fResult : float;
		
	fResult = fBias <= 0.5? BiasRaw(Mathf.Abs(x), fBias) : 1.0 - BiasRaw(1.0 - Mathf.Abs(x), 1.0 - fBias);
	
	return x<0.0? -fResult : fResult;
	}

	

// ----------- funciones de UnifyWiki modificadas


private function TexSetPixel (x : int, y : int, col : Color32)
	{
	if (x >= 0 && x < m_pixelsWd && y >= 0 && y < m_pixelsHt)
		m_pixels[y * m_pixelsWd + x] = col;
	}
	
	
private function TexLine (x0 : int, y0 : int, x1 : int, y1 : int, col : Color32) 
	{
    var dy = y1-y0;
    var dx = x1-x0;
    
    if (dy < 0) {dy = -dy; var stepy = -1;}
    else {stepy = 1;}
    if (dx < 0) {dx = -dx; var stepx = -1;}
    else {stepx = 1;}
    dy <<= 1;
    dx <<= 1;
	
    TexSetPixel(x0, y0, col);
    if (dx > dy) {
        var fraction = dy - (dx >> 1);
        while (x0 != x1) {
            if (fraction >= 0) {
                y0 += stepy;
                fraction -= dx;
            }
            x0 += stepx;
            fraction += dy;
            TexSetPixel(x0, y0, col);
        }
    }
    else {
        fraction = dx - (dy >> 1);
        while (y0 != y1) {
            if (fraction >= 0) {
                x0 += stepx;
                fraction -= dy;
            }
            y0 += stepy;
            fraction += dx;
            TexSetPixel(x0, y0, col);
        }
    }
}


private function TexCircle (cx : int, cy : int, r : int, col : Color32) 
	{
    var y = r;
    var d = 1/4 - r;
    var end = Mathf.Ceil(r/Mathf.Sqrt(2));
    
    for (var x = 0; x <= end; x++) {
        TexSetPixel(cx+x, cy+y, col);
        TexSetPixel(cx+x, cy-y, col);
        TexSetPixel(cx-x, cy+y, col);
        TexSetPixel(cx-x, cy-y, col);
        TexSetPixel(cx+y, cy+x, col);
        TexSetPixel(cx-y, cy+x, col);
        TexSetPixel(cx+y, cy-x, col);
        TexSetPixel(cx-y, cy-x, col);
        
        d += 2*x+1;
        if (d > 0) {
            d += 2 - 2*y--;
        }
    }
}