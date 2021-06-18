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
// CarVisuals
//
// Provides visual effects for the wheels including rotation, steering, suspension, skidmarks and smoke.
//
//========================================================================================================================

#pragma strict

var PivotFL : Transform;
var PivotFR : Transform;
var PivotRL : Transform;
var PivotRR : Transform;
var MeshFL : Transform;
var MeshFR : Transform;
var MeshRL : Transform;
var MeshRR : Transform;
var SteeringWheel : Transform;
var ignoredColliders : Collider[];	// Colliders que deben ser ignorados al calcular la posición de las ruedas. Son los colliders que toquen a los WheelColliders. Es necesario para evitar que las ruedas "salten" si se usa interpolación en el rigidbody.

var forwardSkidmarksBegin = 1.5;	
var forwardSkidmarksRange = 1.0;
var sidewaysSkidmarksBegin = 1.5;
var sidewaysSkidmarksRange = 1.0;
var skidmarksWidth = 0.275;			// Ancho de las marcas de la rueda
var skidmarksOffset = 0.0;			// Ajuste de posición de las marcas de la rueda. >0 más separadas, <0 más juntas. Necesario ajustar en tiempo de diseño (no cambian runtime).

var forwardSmokeBegin = 5.0;	
var forwardSmokeRange = 3.0;
var sidewaysSmokeBegin = 4.0;
var sidewaysSmokeRange = 3.0;
var smokeStartTime = 2.0;			// Segundos que es necesario pasar quemando rueda antes de que empiece a salir humo progresivamente.
var smokePeakTime = 8.0;			// Tiempo en el que el humo sale a toda la intensidad.
var smokeMaxTime = 10.0;			// Tiempo maximo que se tiene en cuenta antes de empezar a decrementar tiempo.

var wheelGroundedBias = 0.02;		// Distancia de penetración de la rueda en el suelo (simula la deformación por el peso)
var steeringWheelMax = 520;			// Grados de giro del volante, en cada sentido.
var clip: AudioClip;

// Clases y objetos internos

class WheelVisualData
	{
	var colliderOffset : float = 0.0;
	var skidmarkOffset : float = 0.0;
	
	var wheelVelocity : Vector3 = Vector3.zero;
	var groundSpeed : Vector3 = Vector3.zero;
	var lastSkidmark : int = -1;
	var skidmarkTime : float = 0.0;	
	
	var skidSmokeTime : float = Time.time;
	var skidSmokePos : Vector3 = Vector3.zero;
	var skidSmokeIntensity : float = 0.0;
	}


private var m_Car : CarControl;

private var m_skidmarks : Skidmarks;
private var m_skidSmoke : ParticleEmitter;
private var m_wheelData : WheelVisualData[];


function Start ()
	{
	m_Car = GetComponent(CarControl) as CarControl;
	
	m_skidmarks = FindObjectOfType(Skidmarks) as Skidmarks;
	m_skidSmoke = m_skidmarks.GetComponentInChildren(ParticleEmitter) as ParticleEmitter;
	m_wheelData = new WheelVisualData[4];
	for (var i=0; i<4; i++)
		m_wheelData[i] = new WheelVisualData();
		
	m_wheelData[0].colliderOffset = transform.InverseTransformDirection(PivotFL.position - m_Car.WheelFL.transform.position).x;
	m_wheelData[1].colliderOffset = transform.InverseTransformDirection(PivotFR.position - m_Car.WheelFR.transform.position).x;
	m_wheelData[2].colliderOffset = transform.InverseTransformDirection(PivotRL.position - m_Car.WheelRL.transform.position).x;
	m_wheelData[3].colliderOffset = transform.InverseTransformDirection(PivotRR.position - m_Car.WheelRR.transform.position).x;

	m_wheelData[0].skidmarkOffset = m_wheelData[0].colliderOffset - skidmarksOffset;
	m_wheelData[1].skidmarkOffset = m_wheelData[1].colliderOffset + skidmarksOffset;
	m_wheelData[2].skidmarkOffset = m_wheelData[2].colliderOffset - skidmarksOffset;
	m_wheelData[3].skidmarkOffset = m_wheelData[3].colliderOffset + skidmarksOffset;	
	}
	
	
function Update () 
	{
	// Efectos visuales (giro de ruedas, derrape, humo)

	DoWheelVisuals(m_Car.WheelFL, MeshFL, PivotFL, m_wheelData[0]);
	DoWheelVisuals(m_Car.WheelFR, MeshFR, PivotFR, m_wheelData[1]);
	DoWheelVisuals(m_Car.WheelRL, MeshRL, PivotRL, m_wheelData[2]);
	DoWheelVisuals(m_Car.WheelRR, MeshRR, PivotRR, m_wheelData[3]);
	
	// Ajuste del mesh según el ángulo de giro y la compresión de la suspensión para todas las ruedas.
	// El Raycast se desactiva en los colliders que tocan a WheelCollider para evitar incidir con ellos cuando la interpolación está activada en el rigidbody.
	
	var steerL = m_Car.getSteerL(); 
	var steerR = m_Car.getSteerR();
	
	for (var coll in ignoredColliders)
		coll.gameObject.layer = 2;
		
	DoWheelPosition(m_Car.WheelFL, PivotFL, steerL, m_wheelData[0]);
	DoWheelPosition(m_Car.WheelFR, PivotFR, steerR, m_wheelData[1]);
	DoWheelPosition(m_Car.WheelRL, PivotRL, 0, m_wheelData[2]);
	DoWheelPosition(m_Car.WheelRR, PivotRR, 0, m_wheelData[3]);
	
	for (var coll in ignoredColliders)
		coll.gameObject.layer = 0;
		
	// Ajustar el volante, si hay
	
	if (SteeringWheel)
		{
		var currentAngle = m_Car.steerInput >= 0.0? steerR : steerL;
		SteeringWheel.localEulerAngles.z = -steeringWheelMax * currentAngle/m_Car.steerMax;
		}	
	}

	
function DoWheelVisuals(Wheel : CarWheel, Graphic : Transform, Pivot : Transform, wheelData : WheelVisualData)
	{
	var WheelCol : WheelCollider;
	var Hit : WheelHit;
	var deltaT : float;
	var Skid : float;
	var wheelSpeed : float;
	
	var forwardSkidValue : float;
	var sidewaysSkidValue : float;
	var skidValue : float;
	
	WheelCol = Wheel.getWheelCollider();
	
	if (WheelCol.GetGroundHit(Hit))
		{
		// Calcular la velocidad en el punto de contacto.
		// Si el contacto es con otro objeto movil (rigidbody) se calcula la velocidad relativa a ese objeto.
		
		wheelData.wheelVelocity = rigidbody.GetPointVelocity(Hit.point);
		if (Hit.collider.attachedRigidbody)
			wheelData.wheelVelocity -= Hit.collider.attachedRigidbody.GetPointVelocity(Hit.point);

		// Traducir la velocidad a la dirección de la rueda. Quedará la velocidad longitudinal en z y la lateral en x.
		
		wheelData.groundSpeed = Pivot.transform.InverseTransformDirection(wheelData.wheelVelocity);  

		// Obtener los límites de fricción y ajustar los parámetros si es necesario
			
		var frictionPeak = Wheel.getForwardPeakSlip();
		var frictionMax = Wheel.getForwardMaxSlip();
		
		var MotorSlip = Wheel.motorInput;
		var BrakeSlip = Wheel.brakeInput;
		
		// Giro de marcha de las ruedas.

		var TorqueSlip = Mathf.Abs(MotorSlip) - Mathf.Max(BrakeSlip); //, HandbrakeInput * frictionMax);
				
		if (TorqueSlip >= 0)	// Acelerando
			{
			Skid = TorqueSlip -	frictionPeak;
			if (Skid > 0)
				{
				wheelSpeed = Mathf.Abs(wheelData.groundSpeed.z) + Skid;
				
				if (MotorSlip < 0)	// Acelerando marcha atrás
					wheelSpeed = -wheelSpeed;
				}
			else
				wheelSpeed = wheelData.groundSpeed.z;
			}
		else	// Frenando. Hit.forwardSlip >= 0 sería hacia adelante, <0 hacia atrás, pero no hace falta tenerlo en cuenta.
			{
			Skid = Mathf.InverseLerp(frictionMax, frictionPeak, -TorqueSlip);			
			wheelSpeed = wheelData.groundSpeed.z * Skid;
			}
			
		if (m_Car.serviceMode)
			wheelSpeed = RpmToMs(WheelCol.rpm, WheelCol.radius * Wheel.transform.lossyScale.y);
		
		Graphic.Rotate((wheelSpeed / (WheelCol.radius * Wheel.transform.lossyScale.y)) * Time.deltaTime * Mathf.Rad2Deg, 0.0, 0.0);	
		
		// Determinar si hace falta controlar las marcas de las ruedas en el suelo.
		// - Si no se están poniendo marcas ahora mismo en esa rueda, se comprobará cada frame si hay que ponerlas.
		// - Si se están poniendo marcas ahora mismo, se esperará al siguiente intervalo fixed para ver si hay que poner más.
		//
		// Se ponen sólo en el terreno que NO tenga material físico (se asume que ese es material sólido).
		
		// NOTA: Todo ésto, o la mayor parte, debería ir en un script en Skidmarks / skidsmoke, para poder indicar settings globales (ej. zona roja para smoke) y coger los parámetros adecuados del propio objeto (ej. propiedades del emisor de partículas)
		
		if (wheelData.lastSkidmark != -1 && wheelData.skidmarkTime < Time.fixedDeltaTime)
			wheelData.skidmarkTime += Time.deltaTime;
		else
			{
			// ------------------
			// Marcas de las ruedas
			// ------------------
			
			deltaT = wheelData.skidmarkTime;
			if (deltaT == 0.0) deltaT = Time.deltaTime;
			wheelData.skidmarkTime = 0.0;
			
			forwardSkidValue = Mathf.InverseLerp(forwardSkidmarksBegin, forwardSkidmarksBegin+forwardSkidmarksRange, Mathf.Abs(Wheel.getForwardSlipRatio()));			
			sidewaysSkidValue = Mathf.InverseLerp(sidewaysSkidmarksBegin, sidewaysSkidmarksBegin+sidewaysSkidmarksRange, Mathf.Abs(Wheel.getSidewaysSlipRatio()));
			skidValue = Mathf.Max(forwardSkidValue, sidewaysSkidValue);
			
			// Caso particular: al frenar bloqueando la rueda usar el skidvalue correspondiente a la velocidad del frenado
			
			var skidmarksLock = Mathf.Min(forwardSkidmarksBegin, 2.0);			
			if (TorqueSlip < 0 && Mathf.Abs(Wheel.getForwardSlipRatio()) >= skidmarksLock)
				{				
				forwardSkidValue = Mathf.InverseLerp(forwardSkidmarksBegin, forwardSkidmarksBegin+forwardSkidmarksRange, Mathf.Abs(wheelData.groundSpeed.z + skidmarksLock));
				skidValue = Mathf.Max(forwardSkidValue, sidewaysSkidValue);
				}
				
			if (skidValue > 0.0 && !Hit.collider.sharedMaterial){
//			if(!audio.isPlaying){
//				Debug.Log("playing");
//				audio.Play();
//				}
				wheelData.lastSkidmark = m_skidmarks.AddSkidMark(Hit.point + wheelData.wheelVelocity * deltaT + transform.right * wheelData.skidmarkOffset,
																 			Hit.normal,
																			skidValue * Mathf.Clamp01(Hit.force / WheelCol.suspensionSpring.spring),
																			skidmarksWidth,
																			wheelData.lastSkidmark);
																			}
			else
				wheelData.lastSkidmark = -1;
			
			// ------------------
			// Humo
			// ------------------
			
			// Determinar si hace falta echar humo en las marcas de las ruedas.
			
			forwardSkidValue = Mathf.InverseLerp(forwardSmokeBegin, forwardSmokeBegin+forwardSmokeRange, Mathf.Abs(Wheel.getForwardSlipRatio()));
			sidewaysSkidValue = Mathf.InverseLerp(sidewaysSmokeBegin, sidewaysSmokeBegin+sidewaysSmokeRange, Mathf.Abs(Wheel.getSidewaysSlipRatio())) * Wheel.getDriftFactor();
			skidValue = Mathf.Max(forwardSkidValue, sidewaysSkidValue);
			
			var smokeIntensity = wheelData.skidSmokeIntensity;

			// Casos particulares
			// - Permitir empezar con máxima intensidad directa en los derrapes laterales (sin tener que esperar por los tiempos)
			
			if (sidewaysSkidValue > 0.0 && smokeIntensity < sidewaysSkidValue*smokePeakTime) smokeIntensity = sidewaysSkidValue*smokePeakTime;
				
			// - Al frenar bloqueando la rueda usar el skidvalue correspondiente a la velocidad del frenado. Comenzar a emitir inmediatamente desde el inicio de la intensidad.
				
			var smokeLock = Mathf.Min(forwardSmokeBegin, 2.0);
			
			if (TorqueSlip < 0 && Mathf.Abs(Wheel.getForwardSlipRatio()) >= smokeLock)
				{				
				forwardSkidValue = Mathf.InverseLerp(forwardSmokeBegin, forwardSmokeBegin+forwardSmokeRange, Mathf.Abs(wheelData.groundSpeed.z + smokeLock));
				skidValue = Mathf.Max(forwardSkidValue, sidewaysSkidValue);
				if (smokeIntensity < smokeStartTime)
					smokeIntensity = smokeStartTime;
				}

			// Aumentar o disminuir la intensidad del humo en función del derrape
			
			if (skidValue > 0.0)
				smokeIntensity += deltaT;
			else
				smokeIntensity -= deltaT;
				
			if (smokeIntensity >= smokeMaxTime) smokeIntensity = smokeMaxTime;
			else if (smokeIntensity < 0.0) smokeIntensity = 0.0;				
							
			skidValue *= Mathf.InverseLerp(smokeStartTime, smokePeakTime, smokeIntensity);			
			var smokePos = Hit.point + transform.up * WheelCol.radius * Wheel.transform.lossyScale.y * 0.5 + transform.right * wheelData.skidmarkOffset;
			
			if (skidValue > 0.0 && !Hit.collider.sharedMaterial)
				{
				var emission : float = Random.Range(m_skidSmoke.minEmission, m_skidSmoke.maxEmission);
				var lastParticleCount : float = wheelData.skidSmokeTime * emission;
				var currentParticleCount : float = Time.time * emission;
				var numParticles : int = Mathf.CeilToInt(currentParticleCount) - Mathf.CeilToInt(lastParticleCount);
				var lastParticle : int = Mathf.CeilToInt(lastParticleCount);				
				
				var Vel = WheelCol.transform.TransformDirection(m_skidSmoke.localVelocity) + m_skidSmoke.worldVelocity;
				Vel += Pivot.forward * (wheelData.groundSpeed.z - wheelSpeed) * 0.125;
				Vel += wheelData.wheelVelocity * m_skidSmoke.emitterVelocityScale;
					
				for (var i = 0; i < numParticles; i++)
					{
					var particleTime : float = Mathf.InverseLerp(lastParticleCount, currentParticleCount, lastParticle + i);
					var PosRnd = Vector3(Random.Range(-0.3, 0.3), Random.Range(-0.2, 0.2), Random.Range(-0.2, 0.2));
					var VelRnd = Vector3(Random.Range(-m_skidSmoke.rndVelocity.x, m_skidSmoke.rndVelocity.x), Random.Range(-m_skidSmoke.rndVelocity.y, m_skidSmoke.rndVelocity.y), Random.Range(-m_skidSmoke.rndVelocity.z, m_skidSmoke.rndVelocity.z));
					var Size = Random.Range(m_skidSmoke.minSize, m_skidSmoke.maxSize);
					var Energy = Random.Range(m_skidSmoke.minEnergy, m_skidSmoke.maxEnergy);		
					var Rotation = m_skidSmoke.rndRotation? Random.value * 360 : 0;
					var RotVel = m_skidSmoke.angularVelocity + Random.Range(-m_skidSmoke.rndAngularVelocity, m_skidSmoke.rndAngularVelocity);
					
					m_skidSmoke.Emit(Vector3.Lerp(wheelData.skidSmokePos, smokePos, particleTime) + PosRnd, Vel + VelRnd, Size*1, Energy*skidValue, Color(1,1,1,1), Rotation, RotVel);
					}				
				}
			
			wheelData.skidSmokeTime = Time.time;
			wheelData.skidSmokePos = smokePos;
			wheelData.skidSmokeIntensity = smokeIntensity;
			}
		}
	else
		{
		Graphic.Rotate(WheelCol.rpm * 6 * Time.deltaTime, 0, 0);  // rpm/60 = revs/sec;  revs/sec * 360 = grados/sec;  360/60 = 6	
		wheelData.lastSkidmark = -1;
		
		wheelData.skidSmokeTime = Time.time;
		wheelData.skidSmokePos = Wheel.transform.position - Wheel.transform.up * ((WheelCol.suspensionDistance + WheelCol.radius * 0.5) * Wheel.transform.lossyScale.y) + transform.right * wheelData.skidmarkOffset;
		wheelData.skidSmokeIntensity -= Time.deltaTime;
		}
	}


// Ajustar la posición de la rueda respecto al suelo

function DoWheelPosition(Wheel : CarWheel, WheelMesh : Transform, steerAngle : float, wheelData : WheelVisualData)
	{
	var hit : RaycastHit;
	
	var WheelCol : WheelCollider = Wheel.getWheelCollider();

	if (Physics.Raycast(Wheel.transform.position, -Wheel.transform.up, hit, (WheelCol.suspensionDistance + WheelCol.radius) * Wheel.transform.lossyScale.y))
		WheelMesh.position = hit.point + Wheel.transform.up * (WheelCol.radius * Wheel.transform.lossyScale.y - wheelGroundedBias) + transform.right * wheelData.colliderOffset;
	else
		WheelMesh.position = Wheel.transform.position - Wheel.transform.up * (WheelCol.suspensionDistance * Wheel.transform.lossyScale.y + wheelGroundedBias) + transform.right * wheelData.colliderOffset;
		
	WheelMesh.localEulerAngles.y = Wheel.transform.localEulerAngles.y + steerAngle;
	WheelMesh.localEulerAngles.z = Wheel.transform.localEulerAngles.z;
	}
	
	
// Conversión RPM - m/s

function RpmToMs(Rpm : float, Radius : float) : float
	{
	return Mathf.PI * Radius * Rpm / 30.0;
	}
	
function MsToRpm(Ms : float, Radius : float) : float
	{
	return 30.0 * Ms / (Mathf.PI * Radius);
	}	
	
	
	
	
	