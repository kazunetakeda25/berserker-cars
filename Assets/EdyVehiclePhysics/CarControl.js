
#pragma strict

// Objetos controlados

var WheelFL : CarWheel;
var WheelFR : CarWheel;
var WheelRL : CarWheel;
var WheelRR : CarWheel;
var AntiRollFront : CarAntiRollBar;
var AntiRollRear : CarAntiRollBar;

var CenterOfMass : Transform;

// Curvas de fricción de las ruedas

var ForwardWheelFriction : CarFrictionCurve;
var SidewaysWheelFriction : CarFrictionCurve;
var optimized = false;				// En modo optimizado los parámetros de las curvas de fricción no se pueden cambiar en tiempo real (no responden adecuadamente).

// Parámetros de entrada

var steerInput = 0.0;
var motorInput = 0.0;
var brakeInput = 0.0;
var handbrakeInput = 0.0;
var gearInput : int = 1;

// Parámetros de rendimiento y comportamiento

var steerMax = 45.0;
var motorMax = 1.0;			// Cantidad máxima de slip de aceleración antes de TC
var brakeMax = 1.0;			// Cantidad máxima de slip de frenado antes de ABS

var autoSteerLevel = 1.0;	// ESP
var autoMotorMax = true;	// TC
var autoBrakeMax = true;	// ABS
var antiRollLevel = 1.0;	// Barras estabilizadoras

var motorPerformancePeak = 5.0;		// m/s de aceleración máxima en modo 4x4. En tracción simple es necesario subir el motorForceFactor
var motorForceFactor = 1.0;
var motorBalance = 0.5;				// 0.0 = tracción delantera, 1.0 = tracción trasera, 0.5 = 4x4.
var brakeForceFactor = 1.5;
var brakeBalance = 0.5;				// 0.0 = todo adelante, 1.0 = todo atrás, 0.5 = mismo nivel.

var sidewaysDriftFriction = 0.35;
var staticFrictionMax = 1500.0;		// Control de fricción - ver CarWheel.
var frontSidewaysGrip = 1.0;
var rearSidewaysGrip = 1.0;

// Parámetros de configuración

var serviceMode = false;			// Si está activado se asignan los parámetros de grip tal cual. Permite hacer las pruebas de las curvas de fricción.

var airDrag = 3 * 2.2;		// Coeficiente aerodinámico (ej. corvette 0.30) * Area frontal
var frictionDrag = 30.0;	// 30 veces la resistencia del aire (así airDrag será más importante a partir de 30 m/s = 100 Km/h)

var rollingFrictionSlip = 0.075;

// MODO EXPERIMENTAL V3:
// - Reduce la tracción a medida que se aproxima a la velocidad máxima. Alcanzando ésta la tracción es 0.

var tractionV3 = false;
var maxSpeed = 40.0;



// ------------------------------------------------
// Datos privados + telemetría

private var m_motorSlip = 0.0;
private var m_brakeSlip = 0.0;

private var m_frontMotorSlip = 0.0;
private var m_frontBrakeSlip = 0.0;
private var m_rearMotorSlip = 0.0;
private var m_rearBrakeSlip = 0.0;

private var m_steerL = 0.0;
private var m_steerR = 0.0;
private var m_steerAngleMax = 0.0;

private var m_maxRollAngle = 45.0;

function getGear() : String { return gearInput>0? "D" : gearInput<0? "R" : "N"; }
function getMotor() : float { return motorInput; }
function getBrake() : float { return brakeInput; }
function getHandBrake() : float { return handbrakeInput; }

function getSteerL() : float { return m_steerL; }
function getSteerR() : float { return m_steerR; }

function getMaxRollAngle() : float { return m_maxRollAngle; }


function OnEnable ()
	{
	ApplyEnabled(WheelFL, true);
	ApplyEnabled(WheelFR, true);
	ApplyEnabled(WheelRL, true);
	ApplyEnabled(WheelRR, true);
	}
	
function OnDisable ()
	{
	ApplyEnabled(WheelFL, false);
	ApplyEnabled(WheelFR, false);
	ApplyEnabled(WheelRL, false);
	ApplyEnabled(WheelRR, false);
	}
	

function Start ()
	{
	// Centro de Masas (CoM)
	// LocalScale es necesario para aplicar cualquier escalado que se haya aplicado al modelo.

	if (CenterOfMass) rigidbody.centerOfMass = Vector3(CenterOfMass.localPosition.x * transform.localScale.x, CenterOfMass.localPosition.y * transform.localScale.y, CenterOfMass.localPosition.z * transform.localScale.z);	
	
	// Punto de equilibrio lateral (estimado)
	
	var WheelC : WheelCollider = WheelFL.GetComponent(WheelCollider) as WheelCollider;
	var V = rigidbody.centerOfMass - transform.InverseTransformPoint(WheelC.transform.position);	
	var h = Mathf.Abs((V.y + WheelC.radius + WheelC.suspensionDistance/2.0) * transform.localScale.y);
	var l = Mathf.Abs(V.x * transform.localScale.x);
	m_maxRollAngle = Mathf.Atan2(l, h) * Mathf.Rad2Deg;

	// Otros datos
	
	rigidbody.maxAngularVelocity = 10;
	rigidbody.useConeFriction = false;
	
	// En modo optimizado aplicar los parámetros de las ruedas ahora, entonces recalcular los datos costosos
	
	if (optimized)
		{
		ApplyCommonParameters(WheelFL);
		ApplyCommonParameters(WheelFR);
		ApplyCommonParameters(WheelRL);
		ApplyCommonParameters(WheelRR);
		WheelFL.RecalculateStuff();
		WheelFR.RecalculateStuff();
		WheelRL.RecalculateStuff();
		WheelRR.RecalculateStuff();
		}
	}


function FixedUpdate ()
	{
	//======================================================================
	// 1. Aplicar parámetros a las ruedas
	//======================================================================

	// Parámetros de las ruedas que se establecen una vez en el script de control para no tener que ir rueda por rueda
	
	ApplyCommonParameters(WheelFL);
	ApplyCommonParameters(WheelFR);
	ApplyCommonParameters(WheelRL);
	ApplyCommonParameters(WheelRR);

	// Pámetros para ruedas individuales según configuración actual
	
	ApplyFrontParameters(WheelFL);
	ApplyFrontParameters(WheelFR);
	ApplyRearParameters(WheelRL);
	ApplyRearParameters(WheelRR);
	
	//======================================================================
	// 2. Aplicar tracción / frenado
	//======================================================================

	m_motorSlip = motorInput * motorMax;
	m_brakeSlip = brakeInput * brakeMax;
	
	if (gearInput == 0) m_motorSlip = 0;
	else if (gearInput < 0) m_motorSlip = -m_motorSlip;
	
	// Balance de tracción

	if (serviceMode)
		{
		m_frontMotorSlip = m_motorSlip;
		m_rearMotorSlip = m_motorSlip;
		}
	else
	if (motorBalance >= 0.5)		// reducir tracción adelante
		{
		m_frontMotorSlip = m_motorSlip * (1.0-motorBalance) * 2.0;
		m_rearMotorSlip = m_motorSlip;
		}
	else	// Reducir tracción atrás
		{
		m_frontMotorSlip = m_motorSlip;
		m_rearMotorSlip = m_motorSlip * motorBalance * 2.0;		
		}

	// Balance de frenado
	
	if (serviceMode)
		{
		m_frontBrakeSlip = m_brakeSlip;
		m_rearBrakeSlip = m_brakeSlip;
		}
	else
	if (brakeBalance >= 0.5)  // reducir frenos adelante
		{
		m_frontBrakeSlip = m_brakeSlip * (1.0-brakeBalance) * 2.0;
		m_rearBrakeSlip = m_brakeSlip;
		}
	else	// Reducir frenos atrás
		{
		m_frontBrakeSlip = m_brakeSlip;
		m_rearBrakeSlip = m_brakeSlip * brakeBalance * 2.0;
		}

	ApplyTraction(WheelFL, m_frontMotorSlip, m_frontBrakeSlip, 0.0);
	ApplyTraction(WheelFR, m_frontMotorSlip, m_frontBrakeSlip, 0.0);
	ApplyTraction(WheelRL, m_rearMotorSlip, m_rearBrakeSlip, handbrakeInput);
	ApplyTraction(WheelRR, m_rearMotorSlip, m_rearBrakeSlip, handbrakeInput);

	//======================================================================
	// 3. Aplicar dirección
	//======================================================================
	
	// autoSteerLevel determina el ángulo en el que las ruedas ofrecen la máxima fuerza de giro (peakSlip) a la velocidad actual.
	// Se coge como referencia una rueda cualquiera delantera.

	if (autoSteerLevel > 0.0) 
		{
		var peakSlip = WheelFL.getSidewaysPeakSlip();
		
		var forwardSpeed = Mathf.Abs(transform.InverseTransformDirection(rigidbody.velocity).z * autoSteerLevel);
	//	m_steerAngleMax = 90.0 - Mathf.Acos(peakSlip / (forwardSpeed+1)) * Mathf.Rad2Deg;
	//	var SpeedMS = Vector2(Vector3.Dot(rigidbody.velocity, transform.forward), Vector3.Dot(rigidbody.velocity,transform.right)).magnitude;
	//	SpeedMS = Mathf.Clamp(SpeedMS,0,44);
		
	//	m_steerAngleMax = 90.0 - (45+ SpeedMS);//Mathf.Acos(peakSlip / (forwardSpeed+1)) * Mathf.Rad2Deg;
		if (forwardSpeed > peakSlip)
			m_steerAngleMax = 90.0 - Mathf.Acos(peakSlip / forwardSpeed) * Mathf.Rad2Deg;
		else
			m_steerAngleMax = steerMax;
			
		//	Debug.Log(" m_steerAngleMax " + m_steerAngleMax +  " peakSlip "+ peakSlip + " forwardSpeed : "+forwardSpeed);
		}
		
	else 
		m_steerAngleMax = steerMax;

	// La dirección de giro de cada rueda se calcula en Update para que se visualice con suavidad,
	// incluso en cámara lenta.

	WheelFL.getWheelCollider().steerAngle = m_steerL;
	WheelFR.getWheelCollider().steerAngle = m_steerR;
		
	//======================================================================
	// 4. Fuerzas de resistencia
	//======================================================================
	
	// Resistencia aerodinámica (drag) y resistencia a rodar (rr)
	//
	// Fdrag = -Cdrag * V * |V|
	// Frr = -Crr * V
	
	// Cdrag =  0.5 * Cd * A * rho
	// 	Cd = coeficiente aerodinámico (ej. corvette 0.30)
	//	A = área frontal del vehículo
	//	rho = densidad del aire = 1.29 kg/m3
	//
	// Crr = 30 veces Cdrag (así Fdrag será más importante a partir de 30 m/s = 100 Km/h)
	
	if (!serviceMode)
		{
		var Cdrag = 0.5 * airDrag * 1.29 ; // * (motorMax+1) / 2;
		var Crr = frictionDrag * Cdrag;
		
		var Fdrag = -Cdrag * rigidbody.velocity * rigidbody.velocity.magnitude;
		var Frr = -Crr * rigidbody.velocity;
		
		rigidbody.AddForce(Fdrag + Frr);
		}
		
	//======================================================================
	// 5. Ajustes técnicos adicionales
	//======================================================================
	
	// Barras estabilizadoras
	
	if (AntiRollFront) AntiRollFront.AntiRollFactor = antiRollLevel;
	if (AntiRollRear) AntiRollRear.AntiRollFactor = antiRollLevel;	
	}
	

function Update()
	{
	// Calcular los ángulos de giro de las ruedas para que los cambios de dirección se visualicen con suavemente,
	// incluso en cámara lenta. FixedUpdate coge los valores que haya en el momento.
	if(gameObject.tag!= "Player") {return;}
	CalculateSteerAngles();
	}
	

	
function ApplyEnabled(Wheel : CarWheel, enable : boolean)
	{
	// Necesario comprobar con null, ya que el OnDisable se invoca al finalizar la aplicación, 
	// y el objeto puede no estar ya disponible aunque su referencia sea no nula.
	
	if (Wheel != null) Wheel.enabled = enable;
	}
		
	
function ApplyCommonParameters(Wheel : CarWheel)
	{
	Wheel.ForwardWheelFriction = ForwardWheelFriction;
	Wheel.SidewaysWheelFriction = SidewaysWheelFriction;
	Wheel.brakeForceFactor = brakeForceFactor;
	Wheel.motorForceFactor = motorForceFactor;
	Wheel.performancePeak = motorPerformancePeak;
	Wheel.sidewaysDriftFriction = sidewaysDriftFriction;
	Wheel.staticFrictionMax = staticFrictionMax;
	
	Wheel.serviceMode = serviceMode;
	Wheel.optimized = optimized;
	}

function ApplyFrontParameters(Wheel : CarWheel)
	{
	Wheel.sidewaysForceFactor = frontSidewaysGrip;
	}
	
function ApplyRearParameters(Wheel : CarWheel)
	{
	Wheel.sidewaysForceFactor = rearSidewaysGrip;
	}

function ApplyTraction(Wheel : CarWheel, motorSlip : float, brakeSlip : float, handBrakeInput : float)
	{
	var slipPeak = Wheel.getForwardPeakSlip();
	var slipMax = Wheel.getForwardMaxSlip();
	
	var Hit : WheelHit;
	var slip : float;
	
	// Tracción
	
	var motor = Mathf.Abs(motorSlip);	// motor = [0..motorMax]
	
	if (Wheel.getWheelCollider().GetGroundHit(Hit))
		{
		var steerRot = Quaternion.AngleAxis(Wheel.getWheelCollider().steerAngle, Wheel.transform.up);
		var wheelDir = steerRot * Wheel.transform.forward;	

		var pointV = rigidbody.GetPointVelocity(Hit.point);
		if (Hit.collider.attachedRigidbody)
			pointV -= Hit.collider.attachedRigidbody.GetPointVelocity(Hit.point);
		
		var v = Mathf.Abs(Vector3.Dot(pointV, wheelDir));
		
		if (v + slipPeak <= motorMax)
			{
			slip = motor - v;
			
			if (slip < 0) 
				slip = 0;
			else
			if (autoMotorMax && slip > slipPeak)
				slip = slipPeak;
			}
		else
			{
			var maxSlip : float;
			
			if (tractionV3)			
				maxSlip = Mathf.Lerp(slipPeak, 0, Mathf.InverseLerp(motorMax-slipPeak, maxSpeed, v));
			else
				maxSlip = slipPeak;
			slip = maxSlip * motor / motorMax;
			}
			
		if (motorSlip < 0)
			slip = -slip;
		}
	else
		slip = motorSlip;		
		
	// Frenos
		
	if (autoBrakeMax && brakeSlip > slipPeak)
		brakeSlip = slipPeak;		
		
	brakeSlip = Mathf.Max(brakeSlip, handBrakeInput * slipMax);
	
//	if (brakeSlip >= slipMax)			// Al indicar Infinity cuando se bloquea la rueda, Hit.forwardSlip devolverá el valor de Slip absoluto del terreno,
//		brakeSlip = Mathf.Infinity;		// en la misma forma en que devuelve Hit.sidewaysSlip.	
//	else							
		if (motorInput == 0.0) brakeSlip += rollingFrictionSlip / brakeForceFactor;	

	Wheel.motorInput = slip;
	Wheel.brakeInput = brakeSlip;
	}
	

function setSteerInput(val: float){
	steerInput = val;
}

function setCarForce(val : float){
	motorForceFactor = val;
//	motorPerformancePeak = 10;
}
function CalculateSteerAngles()
	{
	
    var B = (WheelFL.transform.position-WheelFR.transform.position).magnitude;
    var H = (WheelFR.transform.position-WheelRR.transform.position).magnitude;	

	if (steerInput > 0.0)			// Giro a la derecha
		{
		m_steerR = steerMax * steerInput;
		if (m_steerR > m_steerAngleMax) m_steerR = m_steerAngleMax;
		m_steerL = Mathf.Rad2Deg * Mathf.Atan( 1.0 / (Mathf.Tan((90 - m_steerR) * Mathf.Deg2Rad) + B / H));
		}
	else if (steerInput < 0.0)		// Giro a la izquierda
		{
		m_steerL = steerMax * steerInput;
		if (m_steerL < -m_steerAngleMax) m_steerL = -m_steerAngleMax;
		
		m_steerR = -Mathf.Rad2Deg * Mathf.Atan( 1.0 / (Mathf.Tan((90 + m_steerL) * Mathf.Deg2Rad) + B / H));
		}
	else
		{
		m_steerL = 0;
		m_steerR = 0;
		}
	}