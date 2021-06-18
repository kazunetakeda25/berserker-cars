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
// CarWheel
//
// Calculates the friction curves and their limits based on the parameters.
// Also provides the corrective code for the WheelCollider to work in the clamped model, and adjusts the tire behavior
// based on the terrain.
//
//========================================================================================================================

#pragma strict

// Tipos de datos

class CarFrictionCurve extends System.Object
	{
	var grip = 800.0;
	var gripRange = 5.0;
	var drift = 150.0;
	var driftSlope = 0.0;
	}

// Propiedades públicas
	
var motorInput = 0.0;				// Entradas para el motor y el freno, directamente en SLIP.
var brakeInput = 0.0;				// Para ABS y TC se pueden obtener los puntos máximos con getFrictionPeak

var motorForceFactor = 1.0;			// Factor de amplificación de la tracción (ej. 2.0 al pasar de 4x4 a traccion 2 ruedas)
var brakeForceFactor = 1.0;			// Factor de amplificación del frenado (NO es adecuado para el balance de frenos - balancear usando brakeInput)
var sidewaysForceFactor = 1.0;		// Factor de ajuste del agarre lateral (ej. 0.9 para las ruedas que soportan la masa del motor, acentuando el understeer)
var sidewaysDriftFriction = 0.35;	// Factor de agarre lateral cuando las ruedas entran en pérdida longitudinal (burnout - handbrake)

var performancePeak = 2.8;			// Máximo rendimiento de las ruedas del vehículo (aceleración aproximada)
var staticFrictionMax = 1500.0;		// Máxima pendiente para aplicar en fricción estática. 0 (o menos que extremumValue) para desactivar. A más valor mayor pendiente sin deslizar, pero más posibilidad de volcar en impactos.

var ForwardWheelFriction : CarFrictionCurve;
var SidewaysWheelFriction : CarFrictionCurve;

var optimized = false;				// Con TRUE es necesario llamar a RecalculateStuff cada vez que se modifiquen las curvas de fricción.
var serviceMode = false;


// Datos privados

private var m_wheel : WheelCollider;
private var m_rigidbody : Rigidbody;

private var m_forwardFrictionPeak = Vector2(1.0, 1.0);		// x = punto de valor máximo; y = valor máximo
private var m_sidewaysFrictionPeak = Vector2(1.0, 1.0);		// Necesario valor inicial distinto de 0.

private var m_forwardSlipRatio = 0.0;
private var m_sidewaysSlipRatio = 0.0;

private var m_driftFactor = 1.0;

private var m_wheelHit : WheelHit;
private var m_grounded : boolean = false;

private var m_DeltaTimeFactor = 1.0;

function getForwardPeakSlip () : float { return m_wheel.forwardFriction.extremumSlip * m_forwardFrictionPeak.x; }
function getForwardMaxSlip () : float { return m_wheel.forwardFriction.asymptoteSlip; }
function getSidewaysPeakSlip () : float { return m_wheel.sidewaysFriction.extremumSlip * m_sidewaysFrictionPeak.x; }  // extremumSlip aquí siempre es 1.0
function getSidewaysMaxSlip () : float { return m_wheel.sidewaysFriction.asymptoteSlip; }

function getSidewaysPeak () : Vector2 { return m_sidewaysFrictionPeak; }
function getSidewaysMax () : Vector2 { return Vector2(m_wheel.sidewaysFriction.asymptoteSlip, CarWheelFriction.GetValue(CarWheelFriction.MCsideways, m_wheel.sidewaysFriction.asymptoteValue, m_wheel.sidewaysFriction.asymptoteSlip)); }

function getForwardSlipRatio () : float { return m_forwardSlipRatio; }
function getSidewaysSlipRatio () : float { return m_sidewaysSlipRatio; }

function getDriftFactor () : float { return m_driftFactor; }

function getWheelCollider () : WheelCollider { return m_wheel; }


	
function Start ()
	{
	// Acceso al WheelCollider
	
	m_wheel = GetComponent(WheelCollider) as WheelCollider;
	m_rigidbody = m_wheel.attachedRigidbody;
	
	// En modo optimizado, recalcular los datos cotosos ahora. 
	// Si se cambian los parámetros de las curvas de fricción es necesario invocar a RecalculateStuff manualmente.
	
	if (optimized)
		RecalculateStuff();	
	}
	

function RecalculateStuff ()
	{
	// Punto de máximo rendimiento de la curva longitudinal original
	
	m_forwardFrictionPeak = CarWheelFriction.GetPeakValue(CarWheelFriction.MCforward, ForwardWheelFriction.grip, ForwardWheelFriction.gripRange, ForwardWheelFriction.drift);
	
	// Punto de máximo rendimiento de la curva lateral
	
	m_sidewaysFrictionPeak = CarWheelFriction.GetPeakValue(CarWheelFriction.MCsideways, SidewaysWheelFriction.grip, SidewaysWheelFriction.gripRange, SidewaysWheelFriction.drift);
	}
	

/*	

// DEBUG

private var m_lastVelocity = Vector3.zero;
private var m_velocity = Vector3.zero;
private var m_acceleration = Vector3.zero;
private var m_loadMass = 0.0;
private var m_force = Vector3.zero;

static function Lin2Log(value : float) : float
	{
	return Mathf.Log(Mathf.Abs(value)+1) * Mathf.Sign(value);	
	}
	
static function Lin2Log(value : Vector3) : Vector3
	{
	return Vector3.ClampMagnitude(value, Lin2Log(value.magnitude));
	}

	
function Update ()
	{
	var hit : RaycastHit;
	
	if (Physics.Raycast(m_wheel.transform.position, -m_wheel.transform.up, hit, (m_wheel.suspensionDistance + m_wheel.radius) * m_wheel.transform.lossyScale.y))
		{	
		Debug.DrawLine(hit.point, hit.point + m_velocity * 1, Color.gray);
		Debug.DrawLine(hit.point, hit.point + m_acceleration * 1, Color.yellow);
		Debug.DrawLine(hit.point, hit.point + Lin2Log(m_force) * 0.1, Color.magenta);
		}
	}
*/

	
function FixedUpdate ()
	{
	/*
	// DATOS Debug
	
	m_grounded = m_wheel.GetGroundHit(m_wheelHit);	
	if (m_grounded)
		{
		m_velocity = m_rigidbody.GetPointVelocity(m_wheelHit.point);
		m_acceleration = (m_velocity - m_lastVelocity) / Time.deltaTime;
		m_lastVelocity = m_velocity;
		m_loadMass = m_wheelHit.force / -Physics.gravity.y;
		m_force = m_acceleration * m_loadMass;
		}
	else
		{
		m_velocity = Vector3.zero;
		m_lastVelocity = Vector3.zero;
		m_acceleration = Vector3.zero;
		m_loadMass = 0.0;
		m_force = Vector3.zero;
		}
	
	//-----------
	*/
	
	// Calcular el ajuste temporal
	
	m_DeltaTimeFactor = Time.fixedDeltaTime * Time.fixedDeltaTime * 2500.0;   // equivale a (fixedDeltaTime/0.02)^2
	
	// Determinar el estado de la rueda
	
	m_grounded = m_wheel.GetGroundHit(m_wheelHit);	
	
	// Calcular los elementos costosos (picos de las curvas de fricción)
	
	if (!optimized)
		RecalculateStuff();
	
	//======================================================================
	// 1. Fricción longitudinal
	//======================================================================
	
	// Calcular el rendimiento neto aceleración-freno aplicado sobre la rueda. Determinará el factor de amplificación (slopeFactor) a aplicar.
	
	var resultInput = Mathf.Abs(motorInput) - brakeInput;
	
	// Calcular parámetros de ajuste de la curva:
	// - fslipFactor escalará la curva de forma que el punto de máximo rendimiento coincida (mas o menos) con el valor dado.
	// - fSlopeFactor es el stiffnes que multiplicará a grip y a drift.
	//   Si es != 1.0 se desplaza ligeramente el punto de máximo rendimiento, pero no se nota mucho.
	
	var fSlipFactor = serviceMode? 1.0 : performancePeak / m_forwardFrictionPeak.y;		
	var fSlopeFactor = resultInput >= 0.0? motorForceFactor : brakeForceFactor;
	
	// Calcular la curva correcta para el WheelCollider
	
	m_wheel.forwardFriction = GetWheelFrictionCurve(ForwardWheelFriction, fSlopeFactor, fSlipFactor);
	m_wheel.motorTorque = SlipToTorque(motorInput);
	m_wheel.brakeTorque = SlipToTorque(brakeInput);

	//======================================================================
	// 2. Fricción lateral
	//======================================================================
		
	// Calcular la pérdida de agarre lateral en función del rendimiento longitudinal de la rueda
	// Si la rueda está en el suelo se usa el slip longitundinal real, si no se usa el de la entrada.
	
	m_driftFactor = Mathf.Lerp(1.0, sidewaysDriftFriction, Mathf.InverseLerp(m_wheel.forwardFriction.extremumSlip*m_forwardFrictionPeak.x, m_wheel.forwardFriction.asymptoteSlip, Mathf.Abs(m_grounded? m_wheelHit.forwardSlip : resultInput)));
		
	// Calcular y aplicar la curva de fricción lateral en el WheelCollider

	fSlopeFactor = serviceMode? 1.0 : m_driftFactor*sidewaysForceFactor;
	m_wheel.sidewaysFriction = GetWheelFrictionCurve(SidewaysWheelFriction, fSlopeFactor, 1.0);

	//======================================================================
	// 3. Datos, ajustes & correcciones
	//======================================================================	
	
	if (m_grounded)
		{
		// Datos para telemetría
		
		m_forwardSlipRatio = GetWheelSlipRatio(m_wheelHit.forwardSlip, m_wheel.forwardFriction.extremumSlip*m_forwardFrictionPeak.x, m_wheel.forwardFriction.asymptoteSlip);	
		m_sidewaysSlipRatio = GetWheelSlipRatio(m_wheelHit.sidewaysSlip, m_wheel.sidewaysFriction.extremumSlip*m_sidewaysFrictionPeak.x, m_wheel.sidewaysFriction.asymptoteSlip);
		
		// Corregir el diseño de las curvas de fricción de WheelFrictionCurve
		// - Fricción lateral
		
		var absSlip = Mathf.Abs(m_wheelHit.sidewaysSlip);		
		if (staticFrictionMax > m_wheel.sidewaysFriction.extremumValue && absSlip < m_wheel.sidewaysFriction.extremumSlip)   // Baja velocidad - reforzar ligeramente el control estático del WheelCollider
			{
			m_wheel.sidewaysFriction.extremumValue = GetFixedSlope(CarWheelFriction.MCsideways, absSlip, m_wheel.sidewaysFriction.extremumSlip, m_wheel.sidewaysFriction.extremumValue, 0.0);
			if (m_wheel.sidewaysFriction.extremumValue > staticFrictionMax) m_wheel.sidewaysFriction.extremumValue = staticFrictionMax;
			}

		if (absSlip > m_wheel.sidewaysFriction.asymptoteSlip)
			m_wheel.sidewaysFriction.asymptoteValue = GetFixedSlope(CarWheelFriction.MCsideways, absSlip, m_wheel.sidewaysFriction.asymptoteSlip, m_wheel.sidewaysFriction.asymptoteValue, SidewaysWheelFriction.driftSlope);		

		// - Fricción longitudinal
			
		absSlip = Mathf.Abs(m_wheelHit.forwardSlip);
		if (absSlip > m_wheel.forwardFriction.asymptoteSlip)
			m_wheel.forwardFriction.asymptoteValue = GetFixedSlope(CarWheelFriction.MCforward, absSlip, m_wheel.forwardFriction.asymptoteSlip, m_wheel.forwardFriction.asymptoteValue, ForwardWheelFriction.driftSlope);
		
		// Ajustar la curva en función del terreno
		
		if (m_wheelHit.collider.sharedMaterial)
			{
			m_wheel.forwardFriction.stiffness *= (m_wheelHit.collider.sharedMaterial.dynamicFriction + 1.0) * 0.5;
			m_wheel.sidewaysFriction.stiffness *= (m_wheelHit.collider.sharedMaterial.dynamicFriction + 1.0) * 0.5;
			
			// Aplicar fuerza de resistencia fuera de la carretera

			var wheelV = m_rigidbody.GetPointVelocity(m_wheelHit.point);
			m_rigidbody.AddForceAtPosition(wheelV * wheelV.magnitude * -m_wheelHit.force * m_wheelHit.collider.sharedMaterial.dynamicFriction * 0.001, m_wheelHit.point);
			}		
		}
	else
		{
		m_forwardSlipRatio = 0.0;
		m_sidewaysSlipRatio = 0.0;
		}
	}
	
	
	
// Convertir parámetros de fricción en una curva de WheelCollider

function GetWheelFrictionCurve (Friction : CarFrictionCurve, Stiffness : float, SlipFactor : float) : WheelFrictionCurve
	{
	var Curve : WheelFrictionCurve;

	Curve.extremumSlip = 1.0 * SlipFactor;
	Curve.extremumValue = Friction.grip * m_DeltaTimeFactor;
	Curve.asymptoteSlip = (1.0 + Friction.gripRange) * SlipFactor;
	Curve.asymptoteValue = Friction.drift * m_DeltaTimeFactor;
	
	Curve.stiffness = Stiffness;
	return Curve;
	}
		
	
// Convertir un valor de slip en torque para WheelCollider

function SlipToTorque (Slip : float) : float
	{
	return (Slip * m_wheel.mass) / (m_wheel.radius * m_wheel.transform.lossyScale.y * Time.deltaTime);
	}


// Calcular  el estado relativo del deslizamiento de la rueda
//
// 0..1 -> en agarre completo, antes de Peak
// 1..2 -> comenzando a deslizar, entre Peak y Max
// 2... -> deslizando completamente, más de Max

function GetWheelSlipRatio(Slip : float, PeakSlip : float, MaxSlip : float) : float
	{
	var slipAbs : float = Slip >= 0.0? Slip : -Slip;
	var result : float;
	
	if (slipAbs < PeakSlip)
		result = slipAbs / PeakSlip;
	else 
	if (slipAbs < MaxSlip)
		result = 1.0 + Mathf.InverseLerp(PeakSlip, MaxSlip, slipAbs);
	else
		result = 2.0 + slipAbs-MaxSlip;

	return Slip >= 0? result : -result;
	}
	
		
// Obtener la pendiente corregida de la curva en la asíntota para que la rueda se comporte correctamente
// Requerimientos:
//  - Rueda en el suelo
//	- absSlip es el slip actual en valor absoluto
	
function GetFixedSlope(Coefs : float[], absSlip : float, asymSlip : float, asymValue : float, valueFactor : float) : float
	{	
	var Slope : float;
	
	// Valor en el punto de la asíntota. Es el que mantendremos idependientemente de la cantidad de desplazamiento.
		
	var Value = CarWheelFriction.GetValue(CarWheelFriction.MCsideways, asymValue/m_DeltaTimeFactor, asymSlip);
		
	// Nueva pendiente que mantiene el valor con el desplazamiento actual de la rueda aplicando la pendiente controlada indicada (valueVactor)
	
	Slope = CarWheelFriction.GetSlope(CarWheelFriction.MCsideways, absSlip, Value + (absSlip-asymSlip)*valueFactor) * m_DeltaTimeFactor;
	
	return Slope;
	}
	
	
