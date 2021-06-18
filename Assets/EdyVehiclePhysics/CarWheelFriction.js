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
// CarWheelFriction
//
// Magic. Do not touch.
//
//========================================================================================================================

#pragma strict

// Slope:	Número que denota una pendiente en extremumValue o asymptoteValue de WheelFrictionCurve
//			Las "Magic Curve" relacionan el número Slope con la pendiente de la recta resultante en la gráfica WheelFrictionCurve.
// Value:	Valor de aceleración (m/s2, fuerza por masa) producido por la curva WheelFrictionCurve (eje Y)
// Slip: 	valor de desplazamiento (m/s) usado como entrada en la curva WheelFrictionCurve (eje X)


// ============= WheelCollider's MAGIC CURVES ==================
// Coeficientes de las magic curves.
// Son los valores de fricción (Value) en Slip 1.0 para pendientes (Slopes) de 50 en 50, desde 50 a 2500 (total: 50 coeficientes)

static var MCforward =  [ 0.561, 1.114, 1.659, 2.195, 2.724, 3.246, 3.759, 4.266, 4.765, 5.257, 5.741, 6.219, 6.690, 7.154, 7.611, 8.062, 8.506, 8.944, 9.376, 9.801, 10.223, 10.636, 11.044, 11.443, 11.839, 12.229, 12.614, 12.990, 13.363, 13.731, 14.095, 14.452, 14.805, 15.153, 15.496, 15.834, 16.167, 16.495, 16.819, 17.138, 17.453, 17.772, 18.078, 18.380, 18.667, 18.970, 19.260, 19.545, 19.826, 20.103 ];
static var MCsideways = [ 0.555, 1.095, 1.622, 2.135, 2.636, 3.124, 3.600, 4.060, 4.513, 4.951, 5.382, 5.793, 6.199, 6.602, 7.002, 7.348, 7.723, 8.096, 8.419, 8.782,  9.101,  9.403,  9.779, 10.026, 10.322, 10.695, 10.921, 11.157, 11.465, 11.807, 12.005, 12.202, 12.440, 12.741, 13.060, 13.234, 13.394, 13.570, 13.780, 14.033, 14.333, 14.567, 14.707, 14.835, 14.969, 15.119, 15.291, 15.489, 15.714, 15.966 ];
//                          50    100    150    200    250    300    350    400    450    500    550    600    650    700    750    800    850    900    950   1000    1050    1100    1150    1200    1250    1300    1350    1400    1450    1500    1550    1600    1650    1700    1750    1800    1850    1900    1950    2000    2050    2100    2150    2200    2250    2300    2350    2400    2450    2500

// Factores de ajuste para predecir los valores y representar las curvas de fricción

static var MCt0 = 0.9; 
static var MCt1 = 1.3; 

// =============================================================


// Dada una curva de fricción (grip, gripRange, drift) determinar el valor máximo y su posición.
// 
// El valor se usa para calibrar la curva con la aceleración máxima del vehículo (peakValue), 
// y la posición se usa para determinar el estado de agarre de la rueda (peakSlip).

static function GetPeakValue (Coefs : float[], grip : float, gripRange : float, drift : float) : Vector2
	{
	return GetSpLineMax(1.0, GetValue(Coefs, grip, 1.0), 1.0+gripRange, GetValue(Coefs, drift, 1.0+gripRange));
	}

	
// Dado un punto en la gráfica en forma de (Slip, Value) calcular el valor Slope que utilizado
// en grip o drift haría pasar la recta por ese punto.
// 
// Se usa para corregir la curva del wheelcollider.

static function GetSlope (Coefs : float[], Slip : float, Value : float) : float
	{
	// Determinar la pendiente de la linea, o lo que es lo mismo, el valor que tiene en Slip = 1.0
	
	var lineSlope = Value / Slip;
	
	// Descartar límites
	
	if (lineSlope <= Coefs[0])
		return Mathf.InverseLerp(0.0, Coefs[0], lineSlope) * 50;
	else
	if (lineSlope >= Coefs[Coefs.length-1])
		return Coefs.length * 50;
		
	// Interpolar valor en la lista. Localizamos el intervalo por búsqueda binaria.

	var left = -1;
	var right = Coefs.length;
	
	while (right-left > 1)
		{
		var mid = (left+right) >> 1;
		
		if (Coefs[mid] < lineSlope)
			left = mid;
		else
			right = mid;
		}
		
	// Como ya hemos comprobado los límites, el valor buscado está en el intervalo (left, right]

	var x0 : float = Coefs[left];
	var x1 : float = Coefs[right];
	var y0 : float = (left+1) * 50;
	var y1 : float = (right+1) * 50;
	
	var Slope = y0 + (y1-y0) / (x1-x0) * (lineSlope-x0);
	return Slope;
	}


// Dado un valor de slope de WheelFrictionCurve (extremumValue, asymptoteValue) y un punto de Slip
// devuelve el valor (aceleración) que daría esa Slope en el punto de Slip dado.
//
// Se usa para obtener las pendientes de la curva en los puntos extremum y asymptote,
// y calcular con ello las tangentes de la spline.

static function GetValue (Coefs : float[], Slope : float, Slip : float) : float
	{
	var lineSlope : float;
	var x0 : float;
	var y0 : float;
	var x1 : float;
	var y1 : float;
	var i : int;
	
	// Obtener la pendiente real (Value) de la recta Slope

	if (Slope <= 50.0) lineSlope = Coefs[0] * Slope/50.0;
	else 
	if (Slope >= Coefs.length*50.0) lineSlope = Coefs[Coefs.length-1];
	else
		{
		// 50 < Slope < Coefs.length*50
		
		i = Slope/50;
		
		x0 = i * 50;
		x1 = (i+1) * 50;

		y0 = Coefs[i-1];
		y1 = Coefs[i];
		
		lineSlope = y0 + (y1-y0) / (x1-x0) * (Slope-x0);
		}
	
	return lineSlope * Slip;	
	}


// Dada la curva de fricción entre los dos puntos dados determinar el punto con el valor máximo.
//
// Ojo, se asume la forma típica de la curva de fricción entre extremum y asymptote.
// si la curva resulta siempre ascendente el valor extremum coincidirá con el asymptote.

private static function GetSpLineMax (Slip0 : float, Value0 : float, Slip1 : float, Value1 : float) : Vector2
	{
	var s : float;
	var s2 : float;
	var s3 : float;
	var h1 : float;
	var h2 : float;
	var h3 : float;
	var h4 : float;
	var P : Vector2;
	
	var PMax = Vector2(0, -Mathf.Infinity);

	// Definir los puntos y las tangentes
	
	var P0 = Vector2(Slip0, Value0);
	var P1 = Vector2(Slip1, Value1);
	var sl0 = Value0/Slip0;
	var sl1 = Value1/Slip1;

	var T0mult : float = (1 + (Slip1-Slip0) / (Slip1-Slip0+1)) * MCt0;
	var T0 = Vector2(Slip1-Slip0, sl0*Slip1 - Value0) * T0mult;
	var T1 = Vector2(Slip1-Slip0, 0) * MCt1;
	
	// Iterar la spline localizando el punto máximo.
	
	var Steps : int = (Slip1-Slip0) * 10;
	if (Steps < 10) Steps = 10;

	for (var t=0; t<=Steps; t++)
		{
		s = t;
		s /= Steps;
		s2 = s*s;
		s3 = s2*s;
		
		// Valores de las funciones de Hermite
		
		h1 =  2*s3 - 3*s2 + 1;
		h2 = -2*s3 + 3*s2;
		h3 =    s3 - 2*s2 + s;
		h4 =    s3 - s2;
		
		// Punto interpolado
		
		P = h1*P0 + h2*P1 + h3*T0 + h4*T1;
				
		// Una curva de fricción empieza siempre ascendente hacia el máximo, luego baja, y puede volver a crecer antes de terminar.
		
		if (P.y >= PMax.y) PMax = P;
		else break;
		}

	return PMax;
	}
	

// Dibujar la curva de fricción de una rueda en el canvas dado
	
static function DrawFrictionCurve (Canvas : GUICanvas, Coefs : float[], curve : CarFrictionCurve, col : Color)
	{	
	var grip = curve.grip;
	var drift = curve.drift;
	
	if (grip < drift) grip = drift;
	
	var Slip0 = 1.0;
	var Value0 = GetValue(Coefs, grip, Slip0);
	var Slip1 = 1.0 + curve.gripRange;
	var Value1 =  GetValue(Coefs, drift, Slip1);
	
	Canvas.FrictionCurve(Slip0, Value0, Slip1, Value1, curve.driftSlope, col);
	}
	
	
// Dibujar la curva de fricción dada aplicando un escalado de slip dado
	
static function DrawScaledFrictionCurve (Canvas : GUICanvas, Coefs : float[], curve : CarFrictionCurve, scale : float, col : Color)
	{	
	var grip = curve.grip;
	var drift = curve.drift;
	
	if (grip < drift) grip = drift;
	
	var Slip0 = 1.0 * scale;
	var Value0 = GetValue(Coefs, grip, Slip0);
	var Slip1 = (1.0 + curve.gripRange) * scale;
	var Value1 = GetValue(Coefs, drift, Slip1);
	
	Canvas.FrictionCurve(Slip0, Value0, Slip1, Value1, curve.driftSlope, col);
	}
	
