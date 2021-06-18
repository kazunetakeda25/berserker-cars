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
// CarTelemetry
//
// Realtime display with all the information available from the internal components. 
// Also shows the graphic tire telemetry (realtime friction curves) and the debugging gizmos (force lines).
//
//========================================================================================================================

#pragma strict

var Target : CarControl;
var Enabled : boolean;
var Gizmos : boolean;
var Velocity : boolean;
var Curves : boolean;

var m_Style = new GUIStyle();


private var SizeX = 160;
private var SizeY = 64;

private var m_graphF : GUICanvas;
private var m_graphS : GUICanvas;

private var m_graphStabF : GUICanvas;
private var m_graphStabR : GUICanvas;

private var m_graphSpring : GUICanvas;

private var m_graphBar0 : GUICanvas;
private var m_graphBar1 : GUICanvas;
private var m_graphBar2 : GUICanvas;


function Start ()
	{
	// Preparar los gráficos de las curvas de fricción
	
	m_graphF = new GUICanvas(SizeX, SizeY, 10, 10);
	m_graphS = new GUICanvas(SizeX, SizeY, 10, 25);
	m_graphF.SetAlpha(0.5);
	m_graphS.SetAlpha(0.5);

	m_graphF.Clear(Color.black);
	m_graphF.Grid(1, 2, Color(0,0.2,0));
	for (var i=10; i<m_graphF.CanvasHeight(); i+=10)
		m_graphF.LineH(i, Color(0,0.5,0));	
	m_graphF.Save();
	
	m_graphS.Clear(Color.black);
	m_graphS.Grid(1, 2, Color(0,0.2,0)); 
	for (i=10; i<m_graphS.CanvasHeight(); i+=10)
		m_graphS.LineH(i, Color(0,0.5,0));
	m_graphS.Save();
	
	// Preparar los gráficos de las barras estabilizadoras
	
	m_graphStabF = new GUICanvas(96, 64, 1, 1);
	m_graphStabR = new GUICanvas(96, 64, 1, 1);
	m_graphStabF.SetAlpha(0.5);
	m_graphStabR.SetAlpha(0.5);
	
	m_graphStabF.Clear(Color.black);
	m_graphStabF.Grid(.25, .25, Color(0,0.2,0));
	m_graphStabF.Save();	
	m_graphStabR.Clear(Color.black);
	m_graphStabR.Grid(.25, .25, Color(0,0.2,0));
	m_graphStabR.Save();	
	
	if (Target) 
		{
		UpdateFrictionCurves();
		UpdateStabBarCurves();
		}
		
	// Preparar los gráficos de la suspensión
		
	m_graphSpring = new GUICanvas(32, 64, 1, 1);
	m_graphSpring.SetAlpha(0.5);
	m_graphSpring.Clear(Color.black);
	m_graphSpring.Grid(.50, .25, Color(0,0.2,0));
	m_graphSpring.Save();	
		
	// Gráficos de las barras de valor
	
	m_graphBar0 = new GUICanvas(16, 16, 1, 1);
	m_graphBar0.Clear(Color(0.0, 0.5, 0.0, 0.5));
	m_graphBar1 = new GUICanvas(16, 16, 1, 1);
	m_graphBar1.Clear(Color(0.5, 0.5, 0.0, 0.5));
	m_graphBar2 = new GUICanvas(16, 16, 1, 1);
	m_graphBar2.Clear(Color(0.75, 0.0, 0.0, 0.5));	
	}


	
private var SavedForwardCurve = new CarFrictionCurve();
private var SavedSidewaysCurve = new CarFrictionCurve();
private var savedForwardScale = 1.0;

private var SavedStabBarFront = 1.0;
private var SavedStabBarRear = 1.0;


function IsSameCurve(c1 : CarFrictionCurve, c2 : CarFrictionCurve)
	{
	return c1.grip == c2.grip && c1.gripRange == c2.gripRange && c1.drift == c2.drift && c1.driftSlope == c2.driftSlope;
	}
	
function CloneCurve(original : CarFrictionCurve, cloned : CarFrictionCurve)
	{
	cloned.grip = original.grip;
	cloned.gripRange = original.gripRange;
	cloned.drift = original.drift;
	cloned.driftSlope = original.driftSlope;
	}

	
function UpdateFrictionCurves ()
	{
	if (Target.WheelFL.getWheelCollider() != null)
		{
		// Curva longitudinal
		
		m_graphF.Restore();
		m_graphF.LineV(Target.WheelFL.getForwardPeakSlip(), Color.gray);
		m_graphF.LineV(Target.WheelFL.getForwardMaxSlip(), Color.gray);		
		CarWheelFriction.DrawScaledFrictionCurve(m_graphF, CarWheelFriction.MCforward, Target.ForwardWheelFriction, Target.WheelFL.getWheelCollider().forwardFriction.extremumSlip, Color.green);
		CloneCurve(Target.ForwardWheelFriction, SavedForwardCurve);
		
		// Curva lateral
		
		m_graphS.Restore();
		CarWheelFriction.DrawFrictionCurve(m_graphS, CarWheelFriction.MCsideways, Target.SidewaysWheelFriction, Color.green);
		m_graphS.LineV(Target.WheelFL.getSidewaysPeakSlip(), Color.gray);
		m_graphS.LineV(Target.WheelFL.getSidewaysMaxSlip(), Color.gray);
		CloneCurve(Target.SidewaysWheelFriction, SavedSidewaysCurve);
		}
	}	
	
	
function UpdateStabBarCurves ()
	{
	m_graphStabF.Restore();
	m_graphStabF.BiasCurve(Vector2.zero, Vector2.one, Target.AntiRollFront.AntiRollBias, Color.green);
	SavedStabBarFront = Target.AntiRollFront.AntiRollBias;
	
	m_graphStabR.Restore();
	m_graphStabR.BiasCurve(Vector2.zero, Vector2.one, Target.AntiRollRear.AntiRollBias, Color.green);
	SavedStabBarRear = Target.AntiRollRear.AntiRollBias;	
	}


function Update ()
	{
	var forwardScale = 1.0;
	
	if (Target.WheelFL.getWheelCollider() != null)
		forwardScale = Target.WheelFL.getWheelCollider().forwardFriction.extremumSlip;
	
	if (Target && (!IsSameCurve(Target.ForwardWheelFriction, SavedForwardCurve) || !IsSameCurve(Target.SidewaysWheelFriction, SavedSidewaysCurve) || forwardScale != savedForwardScale))
		{
		UpdateFrictionCurves();
		savedForwardScale = forwardScale;
		}
		
	if (Target.AntiRollFront.AntiRollBias != SavedStabBarFront || Target.AntiRollRear.AntiRollBias != SavedStabBarRear)
		UpdateStabBarCurves();
		
	// Dibujar los gizmos
	
	if (Gizmos)
		{
		DoWheelGizmos(Target.WheelFL);
		DoWheelGizmos(Target.WheelFR);
		DoWheelGizmos(Target.WheelRL);
		DoWheelGizmos(Target.WheelRR);
		
		var CoM = Target.CenterOfMass.position;
		var F = Target.transform.forward * 0.05;
		var U = Target.transform.up * 0.05;
		var R = Target.transform.right * 0.05;
		
		Debug.DrawLine(CoM - F, CoM + F, Color.white);
		Debug.DrawLine(CoM - U, CoM + U, Color.white);
		Debug.DrawLine(CoM - R, CoM + R, Color.white);
		}	
	}

	
	
private var m_sDescription = "";


function GetSlipColor(Slip : float) : Color
	{
	Slip = Mathf.Abs(Slip);
	
	if (Slip <= 1.0) return Color.green;
	else if (Slip < 2.0) return Color.yellow;
	else return Color.red;
	}
	
function DoWheelTelemetry(Wheel : CarWheel, Compression : float) : String
	{
	var Hit : WheelHit;
	var WheelCol = Wheel.getWheelCollider();
	var bGrounded = WheelCol.GetGroundHit(Hit);

	if (bGrounded)
		{
		var forwardSlipRatio = Wheel.getForwardSlipRatio(); 
		var sidewaysSlipRatio = Wheel.getSidewaysSlipRatio();
		
		return String.Format("{0} RPM:{1,4:0.} S:{2,5:0.00} F:{3,5:0.} FS:{4,5:0.00} SS:{5,5:0.00} FSR:{6,5:0.00} SSR:{7,5:0.00}\n", // SM:{8,5:0.00} FM:{9,5:0.00}\n",
				Wheel.gameObject.name, WheelCol.rpm, Compression, Hit.force, Hit.forwardSlip, Hit.sidewaysSlip,								
				forwardSlipRatio, sidewaysSlipRatio,
				
				WheelCol.sidewaysFriction.stiffness, WheelCol.forwardFriction.stiffness
				);
		}
	else
		return String.Format("{0} RPM:{1,4:0.} S:{2,5:0.00}\n", Wheel.gameObject.name, WheelCol.rpm, Compression);
	}
	
	
	
function DoWheelGizmos(Wheel : CarWheel)
	{
	var Hit : WheelHit;
	var WheelCol = Wheel.getWheelCollider();
	var bGrounded = WheelCol.GetGroundHit(Hit);
	
	if (bGrounded)
		{
		var forwardSlipRatio = Wheel.getForwardSlipRatio(); 
		var sidewaysSlipRatio = Wheel.getSidewaysSlipRatio();

		var extension = (-WheelCol.transform.InverseTransformPoint(Hit.point).y - WheelCol.radius) / WheelCol.suspensionDistance;
		
		var RayHit : RaycastHit;	
		if (Physics.Raycast(Wheel.transform.position, -Wheel.transform.up, RayHit, (WheelCol.suspensionDistance + WheelCol.radius) * Wheel.transform.lossyScale.y))
			Hit.point = RayHit.point;
		
		Debug.DrawLine(Hit.point, Hit.point + Wheel.transform.up * (Hit.force / 10000.0), extension <= 0.0 ? Color.magenta : Color.white);
		Debug.DrawLine(Hit.point, Hit.point - Wheel.transform.forward * Hit.forwardSlip, GetSlipColor(forwardSlipRatio));
		Debug.DrawLine(Hit.point, Hit.point - Wheel.transform.right * Hit.sidewaysSlip, GetSlipColor(sidewaysSlipRatio));
		if (Velocity) Debug.DrawLine(Hit.point, Hit.point + Target.rigidbody.GetPointVelocity(Hit.point), Color.blue);
		}
	}
 

private var m_LastSpeedMS = 0.0;
private var m_LastSpeedLatMS = 0.0;

private var m_MaxAngularVelocity = Vector3(0,0,0);


function DoTelemetry ()
	{
	m_sDescription = "";

	if (!Enabled || !Target) return;
	
	// Datos de las barras estabilizadoras, si hay
	
	var extFL = 0.0; 
	var extFR = 0.0;
	var extRL = 0.0;
	var extRR = 0.0;
	var antiRollForceF = 0.0;
	var antiRollForceR = 0.0;
	
	if (Target.AntiRollFront)
		{
		extFL = Target.AntiRollFront.getExtensionL();
		extFR = Target.AntiRollFront.getExtensionR();
		antiRollForceF = Target.AntiRollFront.getAntiRollRatio();
		}
		
	if (Target.AntiRollRear)
		{
		extRL = Target.AntiRollRear.getExtensionL();
		extRR = Target.AntiRollRear.getExtensionR();
		antiRollForceR = Target.AntiRollRear.getAntiRollRatio();
		}		

	// Telemetría de las ruedas

	m_sDescription += DoWheelTelemetry(Target.WheelFL, extFL);
	m_sDescription += DoWheelTelemetry(Target.WheelFR, extFR);
	m_sDescription += DoWheelTelemetry(Target.WheelRL, extRL);
	m_sDescription += DoWheelTelemetry(Target.WheelRR, extRR);
	
	m_sDescription += String.Format("Friction F: [{0,5:0.000}, {1,5:0.000}] S: [{2,5:0.000}, {3,5:0.000}]\n", Target.WheelFL.getForwardPeakSlip(), Target.WheelFL.getForwardMaxSlip(), Target.WheelFL.getSidewaysPeakSlip(), Target.WheelFL.getSidewaysMaxSlip());
	m_sDescription += String.Format("Grip F:{0,4:0.00} R:{1,4:0.00} Stab F:{2,5:0.000} R:{3,5:0.000} Steer L:{4,5:0.0} R:{5,5:0.0}\n", Target.WheelFL.getDriftFactor(), Target.WheelRL.getDriftFactor(), antiRollForceF, antiRollForceR, Target.getSteerL(), Target.getSteerR());

	// Telemetría del vehículo

	var SpeedMS = Vector3.Dot(Target.rigidbody.velocity, Target.transform.forward);
	var SpeedLatMS = Vector3.Dot(Target.rigidbody.velocity, Target.transform.right);
	
	var roll = Target.transform.localEulerAngles.z; if (roll > 180.0) roll -= 360.0;
	var pitch = Target.transform.localEulerAngles.x; if (pitch > 180.0) pitch -= 360.0;
	
	var AngV = Target.rigidbody.angularVelocity;
	if (Mathf.Abs(AngV.x) > m_MaxAngularVelocity.x) m_MaxAngularVelocity.x = Mathf.Abs(AngV.x);
	if (Mathf.Abs(AngV.y) > m_MaxAngularVelocity.y) m_MaxAngularVelocity.y = Mathf.Abs(AngV.y);
	if (Mathf.Abs(AngV.z) > m_MaxAngularVelocity.z) m_MaxAngularVelocity.z = Mathf.Abs(AngV.z);

	m_sDescription += String.Format("\nSpeed:{0,6:0.00} m/s {1,5:0.0} km/h {2,5:0.0} mph\n  Abs:{3,6:0.00} m/s Lat:{4,5:0.00} m/s\n  Acc:{5,5:0.00} m/s2 Lat:{6,5:0.00} m/s2\nPitch:{7,6:0.00} Roll:{8,6:0.00}  Max:{9,6:0.00}\n",
						SpeedMS, SpeedMS*3.6, SpeedMS*2.237, Target.rigidbody.velocity.magnitude, SpeedLatMS, (SpeedMS-m_LastSpeedMS) / Time.deltaTime, (SpeedLatMS-m_LastSpeedLatMS) / Time.deltaTime, pitch, roll, Target.getMaxRollAngle());
	m_sDescription += String.Format(" AngV: {0,5:0.00},{2,5:0.00} Max:{3,5:0.00},{5,5:0.00}\n", AngV.x, AngV.y, AngV.z, m_MaxAngularVelocity.x, m_MaxAngularVelocity.y, m_MaxAngularVelocity.z);

	m_LastSpeedMS = SpeedMS;
	m_LastSpeedLatMS = SpeedLatMS;

	// Telemetría del script de control

	m_sDescription += String.Format("\nGear: {0} Accel:{1,5:0.00} Brake:{2,5:0.00} Handbrake:{3,5:0.00} Steer:{4,5:0.00}\nMotorMax:{5,4:0.0} BrakeMax:{6,4:0.0}\n",
						Target.getGear(), Target.getMotor(), Target.getBrake(), Target.getHandBrake(), Input.GetAxis("Horizontal"),
						Target.motorMax, Target.brakeMax);
	
	// Telemetría de las configuraciones

	var Settings : CarSettings = Target.GetComponent(CarSettings) as CarSettings;
	if (Settings)
		m_sDescription += String.Format("StabMode: {0}{1}{2}\n{3}{4}{5}{6}{7}\n",
						Settings.stabilizerMode == 0? "Auto (" : "",
						Settings.getStabilizerModeStr(),
						Settings.stabilizerMode == 0? ") " : "",
						Settings.abs? "ABS " : "",
						Settings.tc? "TC " : "",
						Settings.esp? "ESP " : "",
						Settings.getTractionAxleStr() + " ",
						Time.timeScale < 1.0? "Slow-Motion " : "");
	}


function FixedUpdate ()
	{
	DoTelemetry();
	}
	
	
	
	
function DrawCurvePerformance(x : int, y : int, graph : GUICanvas, slip : float, slipRatio : float)
	{
	var graphBar : GUICanvas;
	
	slip = Mathf.Abs(slip);
	slipRatio = Mathf.Abs(slipRatio);
	
	if (slip > 0.0)
		{
		if (slip > graph.CanvasWidth()) slip = graph.CanvasWidth();
		 
		if (slipRatio < 1.0) graphBar = m_graphBar0;
		else if (slipRatio < 2.0) graphBar = m_graphBar1;
		else graphBar = m_graphBar2;
		
		graphBar.GUIStretchDraw(x, y, slip*graph.ScaleX(), graph.PixelsHeight());
		}
	}
	

function DrawWheelCurves(x : int, y : int, forwardCurve : GUICanvas, sidewaysCurve : GUICanvas, Wheel : CarWheel)
	{
	forwardCurve.GUIDraw(x, y);
	sidewaysCurve.GUIDraw(x, y + forwardCurve.PixelsHeight()*1.1);
	
	var Hit : WheelHit;
	var WheelCol = Wheel.getWheelCollider();
	var bGrounded = WheelCol.GetGroundHit(Hit);

	if (bGrounded)
		{
		DrawCurvePerformance(x, y, forwardCurve, Hit.forwardSlip, Wheel.getForwardSlipRatio());
		DrawCurvePerformance(x, y + forwardCurve.PixelsHeight()*1.1, sidewaysCurve, Hit.sidewaysSlip, Wheel.getSidewaysSlipRatio());
		}
	}
	
	
function DrawStabBarCurve(x : int, y : int, graph : GUICanvas, Bar : CarAntiRollBar)
	{
	var graphBar : GUICanvas = m_graphBar0;
	var ratio = Mathf.Abs(Bar.getAntiRollRatio());
	var travel = Mathf.Abs(Bar.getAntiRollTravel());
	
	if (ratio > 0.75) graphBar = m_graphBar2;
	else if (ratio > 0.5) graphBar = m_graphBar1;	
	
	graph.GUIDraw(x, y);	
	graphBar.GUIStretchDraw(x, y, travel * graph.ScaleX(), graph.PixelsHeight());
	}
	

	

	
function DrawSuspensionPerformance(x : int, y : int, graph : GUICanvas, WheelCol : WheelCollider, travel : float)
	{
	var graphBarTravel : GUICanvas;
	var graphBarForce : GUICanvas;
	
	var Hit : WheelHit;
	var bGrounded = WheelCol.GetGroundHit(Hit);
	
	travel = 1.0 - travel; // Representar compresión: 0.0 = extendido, 1.0 = comprimido
	var forceRatio = Hit.force / WheelCol.suspensionSpring.spring;
	
	if (bGrounded)
		{
		if (travel >= 1.0) graphBarTravel = m_graphBar2;
		else graphBarTravel = m_graphBar0;
			
		if (forceRatio >= 1.0) graphBarForce = m_graphBar1;
		else graphBarForce = m_graphBar0;
			
		travel = Mathf.Clamp01(travel);
		forceRatio = Mathf.Clamp01(forceRatio);
		
		graphBarTravel.GUIStretchDraw(x, y + (1.0-travel)*graph.PixelsHeight(), 0.5*graph.ScaleX(), travel*graph.PixelsHeight());
		graphBarForce.GUIStretchDraw(x+0.5*graph.ScaleX(), y + (1.0-forceRatio)*graph.PixelsHeight(), 0.5*graph.ScaleX(), forceRatio*graph.PixelsHeight());
		}
	}
	
	

function DrawSuspension(x : int, y : int, Bar : CarAntiRollBar)
	{
	m_graphSpring.GUIDraw(x, y);
	m_graphSpring.GUIDraw(x+m_graphSpring.PixelsWidth()+4, y);
	DrawSuspensionPerformance(x, y, m_graphSpring, Bar.WheelL, Bar.getExtensionL());
	DrawSuspensionPerformance(x+m_graphSpring.PixelsWidth()+4, y, m_graphSpring, Bar.WheelR, Bar.getExtensionR());
	}
	
	
function OnGUI ()
	{
	if (!Enabled) return;

	GUI.Box(Rect (8, 8, 440, 231), "Telemetry (B to hide)");
	GUI.Label (Rect (16, 28, 600, 205), m_sDescription, m_Style);
	
	if (Curves)
		{
		DrawWheelCurves(460, 4, m_graphF, m_graphS, Target.WheelFL);
		DrawWheelCurves(460+m_graphF.PixelsWidth()*1.1, 4, m_graphF, m_graphS, Target.WheelFR);
		
		DrawSuspension(460+m_graphF.PixelsWidth()*2.2 + 14, 4, Target.AntiRollFront);
		DrawStabBarCurve(460+m_graphF.PixelsWidth()*2.2, 4+m_graphF.PixelsHeight()*1.1, m_graphStabF, Target.AntiRollFront);
		
		DrawWheelCurves(460, 4+m_graphF.PixelsHeight()*2.2, m_graphF, m_graphS, Target.WheelRL);
		DrawWheelCurves(460+m_graphF.PixelsWidth()*1.1, 4+m_graphF.PixelsHeight()*2.2, m_graphF, m_graphS, Target.WheelRR);		
		
		DrawSuspension(460+m_graphF.PixelsWidth()*2.2 + 14, 4+m_graphF.PixelsHeight()*2.2, Target.AntiRollRear);
		DrawStabBarCurve(460+m_graphF.PixelsWidth()*2.2, 4+m_graphF.PixelsHeight()*3.3, m_graphStabR, Target.AntiRollRear);
		}
	}















