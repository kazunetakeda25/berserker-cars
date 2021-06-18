
#pragma strict

var description : String;
var hasABS = true;
var hasTC = true;
var hasESP = true;
var hasTractionModes = 1;				// 0: eje fijo, 1: fijo + 4x4, 2: intercambiable + 4x4
var mainTractionAxle = 1;  			  	// Eje de tracción principal. 0: frontal, 1: trasero, 2: ambos
var hasVariableStabilizer = false;		// Se puede modificar el modo de estabilidad
var mainStabilizerMode = 0;				// Modo de estabilidad principal (para el caso de que sea fijo)

var abs = true;
var tc = true;
var esp = true;
var tractionAxle = 0;					// 0: frontal, 1: trasero, 2: 4x4

var stabilizerMode = 0;					// 0: auto, 1: offroad, 2: comfort, 3: sport, 4: none
var stabilizerFactor = 1.0;
var espLevel = 1.0;

var externalInput = false;				// El coche recibe la entrada de un componente derivado de CarExternalInput. 
										// El componente Debe estar presente. Si no lo está, el coche no recibirá entrada de ningún tipo.
var bypassTC = false;
var serviceMode = false;


private var m_Car : CarControl;
private var m_ExternalInput : CarExternalInput;

private var STAB_OFFROAD = 0.25;
private var STAB_COMFORT = 0.80;
private var STAB_SPORT = 1.0;


var firstCheck = false;
function Start ()
	{
	m_Car = GetComponent(CarControl) as CarControl;
	m_ExternalInput = GetComponent(CarExternalInput) as CarExternalInput;
	
	if (m_ExternalInput)
		m_ExternalInput.enabled = externalInput;	
	}
	

function Update () 
	{
	
	// En modo de servicio no se toca nada
	
	if (serviceMode) return;
	
	// Desactivar elementos que no están disponibles.
	// Así se puede leer el estado desde fuera.
	
	tc = tc && hasTC;
	abs = abs && hasABS;
	esp = esp && hasESP;
	
	// Ajustar tractionAxle según hasTractionModes (nota: valores desconocidos asumen 0 - eje fijo)
	
	mainTractionAxle = mainTractionAxle && mainTractionAxle;	// Asegurar 0 ó 1
	
	if (hasTractionModes > 2 || hasTractionModes < 0) hasTractionModes = 0;
	
	switch (hasTractionModes)
		{
		case 1:		// Eje fijo + 4x4. Permitir sólo eje principal o 4x4
			if (tractionAxle > 2) tractionAxle = mainTractionAxle;
			else if (tractionAxle != mainTractionAxle) tractionAxle = 2;
			break;
			
		case 2:		// Eje intercambiable + 4x4. Permitir recorrer todas las opciones
			if (tractionAxle > 2) tractionAxle = 0;
			else if (tractionAxle < 0) tractionAxle = 2;
			break;
			
		default: // Configuración fija, frontal, trasero o 4x4
			if (mainTractionAxle > 2) mainTractionAxle = 2;
			else if (mainTractionAxle < 0) mainTractionAxle = 0;
			tractionAxle = mainTractionAxle;
		}
		
	// Ajustar parámetros del script según los settings dados
	// ABS / TC / ESP
	
	m_Car.autoMotorMax = tc && !bypassTC;
	m_Car.autoBrakeMax = abs;
	m_Car.autoSteerLevel = esp? espLevel : 0.0;
	
	// 4x4 / Traccion
	if(!firstCheck) {
		firstCheck = true;
		Debug.Log("checking");
		switch (tractionAxle)
			{
			case 0:		// Eje delantero
				m_Car.motorBalance = 0.0;
				m_Car.motorForceFactor = 2.0;
				break;
				
			case 1:		// Eje trasero
				m_Car.motorBalance = 1;
				m_Car.motorForceFactor = 2.1;
				break;
			
			case 2:		// 4x4
				m_Car.motorBalance = 0.5;
				m_Car.motorForceFactor = 1.0;
				break;
				
			default:
				// No puede darse - tractionAxle se a ajustado arriba
				break;
			}
		}
	
	// Ajustar estabilización
	// 0: auto, 1: offroad, 2: comfort, 3: sport, 4: none	
	
	if (!hasVariableStabilizer)
		stabilizerMode = mainStabilizerMode;
	
	var newAntiRoll = 0.0;
	if (stabilizerMode < 0) stabilizerMode = 4;
	else if (stabilizerMode > 4) stabilizerMode = 0;
	
	switch (stabilizerMode)
		{
		case 0:	// auto
			var Speed = m_Car.rigidbody.velocity.magnitude;

			if (Speed < 3.25) newAntiRoll = STAB_OFFROAD;
			else if (Speed < 19.5) newAntiRoll = STAB_COMFORT;
			else newAntiRoll = STAB_SPORT;
			break;
			
		case 1:	newAntiRoll = STAB_OFFROAD; break;
		case 2:	newAntiRoll = STAB_COMFORT; break;
		case 3: newAntiRoll = STAB_SPORT; break;			
		}
		
	m_Car.antiRollLevel = newAntiRoll * stabilizerFactor;
	
	// Ajustar control externo si está disponible

	if (m_ExternalInput)
		m_ExternalInput.enabled = externalInput;
	}

	
function HasExternalInput() : boolean
	{
	return m_ExternalInput != null;
	}
	
	
function getStabilizerModeStr () : String
	{
	var sResult : String = "none";
	
	if (stabilizerFactor == 0.0) return "none";
	
	switch (stabilizerMode)
		{
		case 0:	// auto
			var level = m_Car.antiRollLevel / stabilizerFactor; 
	
			if (level < STAB_OFFROAD) sResult = "none";
			else if (level < STAB_COMFORT) sResult = "Offroad";
			else if (level < STAB_SPORT) sResult = "Comfort";
			else sResult = "Sport";
			break;
			
		case 1: sResult = "Offroad"; break;
		case 2: sResult = "Comfort"; break;
		case 3: sResult = "Sport"; break;
		}
	
	return sResult;
	}
	
function getStabilizerModeShortStr () : String
	{
	var sResult : String = "none";
	
	if (stabilizerFactor == 0.0) return "none";
	
	switch (stabilizerMode)
		{
		case 0:	sResult = "AUTO"; break;
		case 1: sResult = "offroad"; break;
		case 2: sResult = "comfort"; break;
		case 3: sResult = "sport"; break;
		}
	
	return sResult;
	}
	

	
function getTractionAxleStr () : String
	{
	var sResult : String = "?";
	
	switch (tractionAxle)
		{
		case 0: sResult = "front"; break;
		case 1: sResult = "rear"; break;
		case 2: sResult = "4x4"; break;
		}
		
	return sResult;
	}
	
	
	
	
	
	
	
	
	