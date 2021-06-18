
#pragma strict

var sensitivityH = 5.0;
var sensitivityV = 5.0;
var dampingH = 4.0;
var dampingV = 4.0;

var moveSpeed = 2.0;	// Usar 0 para anclar a punto fijo o a otra transform en movimiento
var moveDamping = 5.0;

var minV = -30.0;
var maxV = 50.0;
var minH = -180.0;		// Usar -180, 180 para movimiento ilimitado
var maxH = 180.0;

var minFov = 10.0;
var maxFov = 60.0;
var fovSensitivity = 20.0;
var fovDamping = 4.0;


private var m_rotH = 0.0;
private var m_rotV = 0.0;
private var m_Pos = Vector3(0, 0, 0);
private var m_fov = 0.0;
private var m_savedFov = 0.0;
private var m_Camera : Camera;


// Orden de las funciones: 
//
// El FreeView de la camara hace OnEnable y OnDisable al arrancar. La primera vez que se activa hace OnEnable, Start, OnDisable. Las siguientes veces hace OnEnable, OnDisable.
// Los FreeView que van en los puntos DriverFront hacen OnEnable, Start, OnDisable al arrancar. Las siguientes veces OnEnable, OnDisable.


function Start ()
	{
	SetLocalEulerAngles(transform.localEulerAngles);
	
	m_Camera = GetComponent(Camera) as Camera;
	if (m_Camera)
		{
		m_fov = m_Camera.fieldOfView;
		m_savedFov = m_Camera.fieldOfView;
		}
	}

	
function OnEnable ()
	{
	SetLocalEulerAngles(transform.localEulerAngles);
	m_Pos = transform.localPosition;
	
	if (m_Camera)
		m_fov = m_Camera.fieldOfView;		
	}

	
function OnDisable ()
	{
	if (m_Camera)
		m_Camera.fieldOfView = m_savedFov;
	}
	

	
function SetLocalEulerAngles (Angles : Vector3)
	{
	m_rotH = Angles.y;
	m_rotV = Angles.x;
	transform.localEulerAngles.z = Angles.z;
	}
	

function LateUpdate () 
	{
	// Orientación
	
	m_rotH += Input.GetAxis("Mouse X") * sensitivityH;		
	m_rotV -= Input.GetAxis("Mouse Y") * sensitivityV;		
	m_rotH = ClampAngle(m_rotH, minH, maxH);
	m_rotV = ClampAngle(m_rotV, minV, maxV);
	
	transform.localEulerAngles.y = Mathf.LerpAngle(transform.localEulerAngles.y, m_rotH, dampingH * Time.deltaTime);
	transform.localEulerAngles.x = Mathf.LerpAngle(transform.localEulerAngles.x, m_rotV, dampingV * Time.deltaTime);

	// Zoom opcional con cámara presente
	
	if (m_Camera)
		{
		m_fov -= Input.GetAxis("Mouse ScrollWheel") * fovSensitivity;
		m_fov = Mathf.Clamp(m_fov, minFov, maxFov);
		m_Camera.fieldOfView = Mathf.Lerp(m_Camera.fieldOfView, m_fov, fovDamping * Time.deltaTime);
		}

	// Movimiento
	
	var stepSize = moveSpeed * Time.deltaTime;
	
	m_Pos += Input.GetAxis("Sideways") * transform.right * stepSize;
	m_Pos += Input.GetAxis("Upwards") * transform.up * stepSize;
	m_Pos += Input.GetAxis("Forwards") * Vector3(transform.forward.x, 0.0, transform.forward.z).normalized * stepSize;
	
	transform.localPosition = Vector3.Lerp(transform.localPosition, m_Pos, moveDamping * Time.deltaTime);
	}
	
	
function ClampAngle (a : float, min : float, max : float) : float 
	{
	while (max < min) max += 360.0;
	while (a > max) a -= 360.0;
	while (a < min) a += 360.0;
	
	if (a > max)
		{
		if (a - (max + min) * 0.5 < 180.0)
			return max;
		else
			return min;
		}
	else
		return a;
	}
