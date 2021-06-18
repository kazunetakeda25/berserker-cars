
#pragma strict

var Cars : CarControl[];
var startupCar = 0;
var MainCamera : CameraControl;
var MainLight : Light;
var reverseRequiresStop = true;
var Payload : Rigidbody;
var slowTime = 0.25;
var showHelp = false;
var guiEnabled = true;

var BigTextStyle : GUIStyle;
var TextStyle : GUIStyle;
var BoxStyle : GUIStyle;
var guiSkin : GUISkin;

private var m_currentCar = 0;
private var m_Car : CarControl;
private var m_CarTelemetry : CarTelemetry;
private var m_CarSettings : CarSettings;
private var m_CarCameras : CarCameras;
private var m_SecondaryCar : CarControl;

private var m_bBrakeRelease = false;
private var m_bAccelRelease = false;
private var GEARSPEEDMIN = 0.2;
var controlsInput : boolean = false;


// Propiedades públicas

function getSelectedCar() : CarControl
	{
	return Cars[m_currentCar];
	}


function Start()
{
	m_CarTelemetry = GetComponent(CarTelemetry) as CarTelemetry;
	
	m_currentCar = startupCar;
	if (m_currentCar >= Cars.length) m_currentCar = Cars.length-1;
	
	for (var i=0; i<Cars.length; i++)
		DisableCar(Cars[i]);
	
	SelectCar(Cars[m_currentCar]);
	
	#if UnityEditor
		controlsInput = false;
		btnControls = true;
	
	#endif
	
	if(Application.platform == RuntimePlatform.Android){
		if(PlayerPrefs.GetInt ("control",0)== 0){
		controlsInput = true;
		btnControls = false;
		}
		else{
		controlsInput = false;
		btnControls = true;
		}
	}
}


function Update ()
	{
	// Aplicar la entrada en el coche seleccionado

	if (!m_CarSettings.externalInput)
		SendInput(m_Car);
	
	// Teclas de la Aplicación
	
	var bShift = Input.GetKey(KeyCode.LeftShift) || Input.GetKey(KeyCode.RightShift);

	// Salir / Debug pause
	
//	if (Input.GetKeyDown(KeyCode.Escape))
//		Application.Quit();

	if (Input.GetKeyDown(KeyCode.P))
		Debug.Break();
	
	// Slow motion
	
	if (Input.GetKeyDown(KeyCode.T))
		if (Time.timeScale < 1.0)
			Time.timeScale = 1.0;
		else
			Time.timeScale = slowTime;

	// Eject payload
	
	if (Input.GetKeyDown(KeyCode.E) && Payload)
		Payload.rigidbody.AddForce(Vector3(0, 6, 0), ForceMode.VelocityChange);

	// Reload level

	if (Input.GetKeyDown(KeyCode.R) && !bShift)
		Application.LoadLevel(0);
		
	// Cambiar de coche
	
	if (Input.GetKeyDown(KeyCode.PageUp))
		SwitchCar(-1);
		
	if (Input.GetKeyDown(KeyCode.PageDown))
		SwitchCar(1);
	
	// Resituar el coche
		
	if (Input.GetKeyDown(KeyCode.Return))
		{
 		//m_Car.rigidbody.AddForce(-m_Car.rigidbody.velocity, ForceMode.VelocityChange);
		//m_Car.rigidbody.AddTorque(-m_Car.rigidbody.angularVelocity, ForceMode.VelocityChange);

		m_Car.rigidbody.velocity = Vector3.zero;
		m_Car.rigidbody.angularVelocity = Vector3.zero;
		
		m_Car.transform.localEulerAngles.x = 0;
		m_Car.transform.localEulerAngles.z = 0;
		m_Car.transform.position += Vector3(0, 1.6, 0);
		}
		
	if (Input.GetKeyDown(KeyCode.R) && bShift)
		{
		var DeformScript : CarDamage = m_Car.GetComponent(CarDamage) as CarDamage;
		if (DeformScript) DeformScript.DoBounce();
		}
		
	// Teclas de configuración del coche
	
	if (Input.GetKeyDown(KeyCode.Alpha1)) m_CarSettings.abs = !m_CarSettings.abs;
	if (Input.GetKeyDown(KeyCode.Alpha2)) m_CarSettings.tc = !m_CarSettings.tc;
	if (Input.GetKeyDown(KeyCode.Alpha3)) m_CarSettings.esp = !m_CarSettings.esp;
	if (Input.GetKeyDown(KeyCode.Alpha4)) m_CarSettings.tractionAxle++;
	if (Input.GetKeyDown(KeyCode.Alpha5)) m_CarSettings.stabilizerMode++;
	
	if (Input.GetKeyDown(KeyCode.I)) m_CarSettings.externalInput = !m_CarSettings.externalInput;
	
	// Teclas de cámaras y vistas
	
	if (Input.GetKeyDown(KeyCode.C)) MainCamera.Next();
		
	if (Input.GetKeyDown(KeyCode.F1)) MainCamera.SwitchTo(0);
	if (Input.GetKeyDown(KeyCode.F2)) MainCamera.SwitchTo(1);
	if (Input.GetKeyDown(KeyCode.F3)) MainCamera.SwitchTo(2);
	if (Input.GetKeyDown(KeyCode.F4)) MainCamera.SwitchTo(3);
	if (Input.GetKeyDown(KeyCode.F5)) MainCamera.SwitchTo(4);
	if (Input.GetKeyDown(KeyCode.F6)) MainCamera.SwitchTo(5);	
	
	if (Input.GetKeyDown(KeyCode.M)) MainCamera.ToggleMap();
	if (Input.GetKeyDown(KeyCode.V)) m_CarCameras.Next();
	if (Input.GetKeyDown(KeyCode.N)) MainCamera.showMirrors = !MainCamera.showMirrors;
	if (m_CarTelemetry && Input.GetKeyDown(KeyCode.B))
		{
		if (!bShift)
			m_CarTelemetry.Enabled = !m_CarTelemetry.Enabled;
		else
			m_CarTelemetry.Curves = !m_CarTelemetry.Curves;			
		}		
		
	if (Input.GetKeyDown(KeyCode.H) || Input.GetKeyDown(KeyCode.Escape))
		showHelp = !showHelp;
	
	// Teclas de calidad y rendimiento
	
	if (Input.GetKeyDown(KeyCode.F12))
		{
		var bQuality = MainLight.light.shadows != LightShadows.None;
		
		if (bQuality)  // Calidad activada, desactivarla
			{
			MainLight.light.shadows = LightShadows.None;
			MainCamera.enableImageEffects = false;
			}
		else
			{
			MainLight.light.shadows = LightShadows.Soft;
			MainCamera.enableImageEffects = true;
			}
		}
	}
	


function SwitchCar (iDir : int)
	{
	if (Cars.length < 2) return;
	
	// Desactivar coche previo
	
	DisableCar(Cars[m_currentCar]);
		
	// Seleccionar coche nuevo
	
	m_currentCar += Mathf.Sign(iDir);
	if (m_currentCar < 0) m_currentCar = Cars.length-1;
	else if (m_currentCar >= Cars.length) m_currentCar = 0;
	
	SelectCar(Cars[m_currentCar]);
	}
	
	
// Desactivar el coche dado. No depende de variables globales.
	
function DisableCar(Car : CarControl)
	{
	// Desactivar elementos visuales
	
	var CarCams : CarCameras = Car.GetComponent(CarCameras) as CarCameras;
	CarCams.showFixedCams = false;
	
	// Desactivar otros elementos del coche
	
	Car.motorInput = 0.0;
	Car.brakeInput = 1.0;
	}

	
// Selecciona el coche dado. Lo activa y obtiene sus componentes.

function SelectCar(Car : CarControl)
	{
	// El coche seleccionado anteriormente será el secundario.
	// Obtener los objetos controlados del vehiculo: control, GUI, settings
		
	if (m_Car)
		{
		MainCamera.Target2 = m_CarCameras.CameraLookAtPoint;
		m_SecondaryCar = m_Car;		
		}
	
	m_Car = Car;	
	m_CarSettings = m_Car.GetComponent(CarSettings) as CarSettings;
	m_CarCameras = m_Car.GetComponent(CarCameras) as CarCameras;
	
	// Ajustar y activar elementos visuales
	
	MainCamera.Target = m_Car.transform;
	m_CarCameras.showFixedCams = true;
	
	// Activar otros elementos
	
	if (m_CarTelemetry)
		m_CarTelemetry.Target = Car;
	}
var FV : float = 0;
var LV : float = 0;
var RV : float = 0;
var RevV : float = 0;

function setFValue(val : float){
FV = val;
}

function LeftValue(val : float){
LV = val;
}

function RightValue(val : float){
RV = val;
}

function ReverseValue(val : float){

RevV = val;
}

var btnControls : boolean =  false;

function SendInput(Car : CarControl)
	{
	// Obtener datos de la entrada
	
	var steerValue = Mathf.Clamp(Input.GetAxis("Horizontal"), -1, 1);
	var forwardValue = Mathf.Clamp(Input.GetAxis("Vertical"), 0, 1);
	var reverseValue = -1 * Mathf.Clamp(Input.GetAxis("Vertical"), -1, 0);
	var handbrakeValue = Mathf.Clamp(Input.GetAxis("Jump"), 0, 1);
	// forwardValue = fV;
	
	if(Application.platform == RuntimePlatform.Android || btnControls){
		if(LV!=0){
		 steerValue = LV;
		}
		if(RV!=0){
		 steerValue = RV;
		}
		reverseValue = -1*RevV;
	//	Debug.Log("rev value " + reverseValue);
		 forwardValue = FV;
	
	}
	if(Application.platform == RuntimePlatform.Android && controlsInput){
		steerValue = Input.acceleration.x;
		reverseValue = -1*RevV;
	//	Debug.Log("rev value " + reverseValue);
		 forwardValue = FV;
	
	}
	
	var speedForward = Vector3.Dot(Car.rigidbody.velocity, Car.transform.forward);
	var speedSideways = Vector3.Dot(Car.rigidbody.velocity, Car.transform.right);
	var speedRotation = Car.rigidbody.angularVelocity.magnitude;
	
	var speedAbs = speedForward * speedForward;
	speedSideways *= speedSideways;
	
	var motorInput : float;
	var brakeInput : float;
	
	if (reverseRequiresStop)
		{
		// Determinar la marcha a meter (adelante - detrás)
		// Las marchas van en función de las acciones sobre el eje vertical (forward - reverse)

		if (speedAbs < GEARSPEEDMIN && forwardValue == 0 && reverseValue == 0)
			{
			m_bBrakeRelease = true;
			Car.gearInput = 0;
			}
			
		if (Car.gearInput >= 0 && forwardValue == 0 || Car.gearInput < 0 && reverseValue == 0)
			m_bAccelRelease = true;

		if (m_bBrakeRelease)
			if (speedAbs < GEARSPEEDMIN)
				{
				// Cambio de marcha en parado
				
				if (reverseValue > 0) { Car.gearInput = -1; }
				if (forwardValue > 0) { Car.gearInput = 1; }
				}
			else
			if (speedSideways < GEARSPEEDMIN && speedRotation < GEARSPEEDMIN)
				{
				// Hacer que entre la marcha adecuada con el coche moviéndose por inercia longitudinalmente.
				// (no se cambia de marcha en desplazamientos laterales)
				
				if (speedForward > 0 && Car.gearInput <= 0 && (forwardValue > 0 || reverseValue > 0)) Car.gearInput = 1;
				if (speedForward < 0 && Car.gearInput >= 0 && (forwardValue > 0 || reverseValue > 0)) Car.gearInput = -1;
				}
		
		if (Car.gearInput < 0)
			{
			motorInput = reverseValue;
			brakeInput = forwardValue;
			}
		else
			{
			motorInput = forwardValue;
			brakeInput = reverseValue;
			}

		if (brakeInput > 0) m_bBrakeRelease = false;
		}
	else
		{
		// Modo adelante-atrás sin detenerse (por Sagron)
		
		if (speedForward > GEARSPEEDMIN)
			{
			Car.gearInput = 1;
			motorInput = forwardValue;
			brakeInput = reverseValue;
			}
		else if (speedForward <= GEARSPEEDMIN && reverseValue > GEARSPEEDMIN)
			{
			Car.gearInput = -1;
			motorInput = reverseValue;
			brakeInput = 0;
			}
		else if (forwardValue > GEARSPEEDMIN && reverseValue <= 0)
			{
			Car.gearInput = 1;
			motorInput = forwardValue;
			brakeInput = 0;
			}
		else if (forwardValue > GEARSPEEDMIN)
			Car.gearInput = 1;
		else if (reverseValue > GEARSPEEDMIN)
			Car.gearInput = -1;
		else
			Car.gearInput = 0;	
		}

	// Aplicar acciones sobre el coche actual
	
	Car.steerInput = steerValue;
	Car.motorInput = motorInput;
	Car.brakeInput = brakeInput;
	Car.handbrakeInput = handbrakeValue;	
	}
	
	
	
	
private function ScrRect(x : float, y : float, wd : float, ht : float) : Rect
	{
	return Rect(x*Screen.width, y*Screen.height, wd*Screen.width, ht*Screen.height);
	}

	
	
private function GUIBoxedText(pos : Rect, text : String, textStyle : GUIStyle, textColor : Color)
	{
	GUI.Box(pos, "");
	
	var savedCol = textStyle.normal.textColor;
	textStyle.normal.textColor = textColor;
	GUI.Label(pos, text, textStyle);
	textStyle.normal.textColor = savedCol;
	}
	
		
function OnGUI ()
	{
	if (!guiEnabled) return;
	return;
	GUI.skin = guiSkin;
	
	// Dashboard
	// ----------------------------------------------------
	
	var Car = getSelectedCar();
	var rc = ScrRect(0.2, 0.04, 0.35, 0.2);

	// AI
	
    if (m_CarSettings.HasExternalInput()) m_CarSettings.externalInput = GUI.Toggle(Rect(rc.x+160, rc.y+2, 50, 18), m_CarSettings.externalInput, "AI", guiSkin.button);
	
	// Nombre del vehículo

//    if (GUI.Toggle(Rect(rc.x+220, rc.y+2, 50, 18), true, "car >", guiSkin.button) == false ||
//		GUI.Button(Rect(rc.x+280, rc.y, 400, 20), m_CarSettings.description, "helptext"))
//		SwitchCar(1);
//	
	// Velocidad y marcha
	
	var SpeedMS = Vector2(Vector3.Dot(Car.rigidbody.velocity, Car.transform.forward), Vector3.Dot(Car.rigidbody.velocity, Car.transform.right)).magnitude;
	GUI.Label(Rect(rc.x, rc.y, 70, 40), String.Format("{0:0.}", SpeedMS * 3.2), BigTextStyle);
	GUI.Label(Rect(rc.x, rc.y+42, 70, 40), String.Format("{0:0.} mph", SpeedMS * 2.237), TextStyle);
	//GUIBoxedText(Rect(rc.x+80, rc.y+6, 55, 50), String.Format("{0}", Car.getGear()), BoxStyle, Car.gearInput < 0? Color.white : Car.gearInput > 0? Color(0.6,0.6,0.6) : Color(0,0.5,0.0));	
return;
	// ABS / TC / ESP
	
    if (m_CarSettings.hasABS) m_CarSettings.abs = GUI.Toggle(Rect(rc.x+160, rc.y+26, 50, 30), m_CarSettings.abs, "ABS", guiSkin.button);
    if (m_CarSettings.hasTC) m_CarSettings.tc = GUI.Toggle(Rect(rc.x+220, rc.y+26, 50, 30), m_CarSettings.tc, "TC", guiSkin.button);
    if (m_CarSettings.hasESP) m_CarSettings.esp = GUI.Toggle(Rect(rc.x+280, rc.y+26, 50, 30), m_CarSettings.esp, "ESP", guiSkin.button);

	// Tracción / modo estabilidad
	
	var bShowEnabled = m_CarSettings.hasTractionModes > 0;
	if (bShowEnabled)
	if (GUI.Toggle(Rect(rc.x+340, rc.y+26, 50, 30), bShowEnabled, m_CarSettings.getTractionAxleStr(), guiSkin.button) != bShowEnabled)
		m_CarSettings.tractionAxle++;
		
	bShowEnabled = m_CarSettings.hasVariableStabilizer;
	if (bShowEnabled)
	if (GUI.Toggle(Rect(rc.x+400, rc.y+26, 60, 30), bShowEnabled, m_CarSettings.getStabilizerModeShortStr(), guiSkin.button) != bShowEnabled)
		m_CarSettings.stabilizerMode++;
		
	showHelp = GUI.Toggle(Rect(rc.x+470, rc.y+26, 60, 30), showHelp, "H Help", "helptext");
		
	// Ayuda

	rc.y = rc.y - 350;
	rc.x = rc.x + 20;
	rc.width = 520;
	rc.height = 270;

	if (showHelp)
		{
		if (GUI.Button(rc, "Offroader v4 / 2011.11.02 - by Edy", guiSkin.box))
			showHelp = false;
		
		rc.x += 10;
		rc.y += 35;
		
		var sHelp1 = "Arrows / WSAD - Accelerate, brake, turn\n" + 
					"Space - handbrake\n" + 
					"Return - unflip car\n" + 
					"shift+R - repair damage\n\n" +
					
					"12345 - ABS, TC, ESP, 4x4, Stabilization\n" +
					"I - Enable AI (pseudo-random)\n\n" + 
					
					"PgUp / PgDown - select vehicle\n" +
					"E - Eject payload\n" +
					"R - Restart demo\n" +
					"T - Slow motion\n\n"
					;
					
		var sHelp2 = "C - camera (also F1-F6)\n" +
					"V - secondary camera\n" +
					"M - minimap\n" +
					"N - mirrors (bus driver only)\n" + 
					"B - telemetry\n" +
					"shift+B - tire telemetry\n\n" +
					
					"mouse - move view in cameras F1,F3,F5\n" +
					"mouseWheel - zoom in F4,F5, dist in F3\n" +
					"NumPad - move camera position in F4,F5\n\n" +
					
					"F12 - toggle low quality mode\n"
					;
					
		var sHelp3 = "Switching gears between (D) and reverse (R) requires the car to completely stop, release accelerate and brake keys, then press accelerate (forward) or brake (reverse).";
		
		GUI.Label(rc, sHelp1);
		
		var rc2 = rc;
		rc2.x += 265;
		
		GUI.Label(rc2, sHelp2);
		
		rc2 = rc;
		rc2.y += 190;
		rc2.width -= 10;
		
		GUI.Label(rc2, sHelp3);
		}
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	