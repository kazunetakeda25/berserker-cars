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
// CarCameras
//
// Manages the vehicle-specific camera settings, including mirror cameras, vehicle cameras, and view parameters.
//
//========================================================================================================================

#pragma strict

var showFixedCams = false;
var startupFixedCam = 0;
var FixedCameras : Camera[];

var MirrorLeft : Camera;
var MirrorRight : Camera;
var MirrorRear : Camera;

var CameraLookAtPoint : Transform;
var DriverFront : Transform;

var viewDistance = 10.0;
var viewHeight = 3.5;
var viewDamping = 3.0;
var viewMinDistance = 3.8;
var viewMinHeight = 0.0;


private var m_currentFixedCam : int;
private var m_DriverViewAngles : Vector3;


function getDriverViewAngles () { return m_DriverViewAngles; }


function Start ()
	{
	m_currentFixedCam = startupFixedCam;
	if (m_currentFixedCam >= FixedCameras.length) m_currentFixedCam = -1;
	
	for (var i=0; i<FixedCameras.length; i++)
		FixedCameras[i].enabled = false;
	
	// Desactivar cámaras espejo: se gestionarán desde CameraControl
	
	if (MirrorLeft) MirrorLeft.enabled = false;
	if (MirrorRight) MirrorRight.enabled = false;
	if (MirrorRear) MirrorRear.enabled = false;
	
	// Desactivar script de movimiento de cámara del conductor, si hay. Se gestionará también desde CameraControl.
	
	if (DriverFront)
		{
		var scrDriverMove : CamFreeView = DriverFront.GetComponent(CamFreeView) as CamFreeView;
		if (scrDriverMove) scrDriverMove.enabled = false;
		
		m_DriverViewAngles = DriverFront.localEulerAngles;
		}
	}


function Next ()
	{
	if (FixedCameras.length == 0) return;
	
	if (m_currentFixedCam >= 0)
		{
		FixedCameras[m_currentFixedCam++].enabled = false;
		if (m_currentFixedCam < FixedCameras.length)
			FixedCameras[m_currentFixedCam].enabled = true && showFixedCams;
		else
			m_currentFixedCam = -1;
		}
	else
		{
		m_currentFixedCam = 0;
		FixedCameras[m_currentFixedCam].enabled = true && showFixedCams;
		}
	}


//function Update () 
//	{
//	// Si tenemos cámara activa y ha cambiado el estado de showFixedCams, mostrar u ocultar según sea apropiado.
//	
//	if (m_currentFixedCam >= 0)
//		{
//		if (showFixedCams && !FixedCameras[m_currentFixedCam].enabled)
//			FixedCameras[m_currentFixedCam].enabled = true;
//		
//		if (!showFixedCams && FixedCameras[m_currentFixedCam].enabled)
//			FixedCameras[m_currentFixedCam].enabled = false;
//		}
//	}
//
