
#pragma strict

var target : Transform;
var damping = 6.0;

var minFov = 10.0;
var maxFov = 60.0;
var fovSensitivity = 20.0;
var fovDamping = 4.0;

var moveSpeed = 2.0;	// Usar 0 para anclar a punto fijo o a otra transform en movimiento
var moveDamping = 5.0;

private var m_Pos : Vector3;
private var m_fov = 0.0;
private var m_savedFov = 0.0;
private var m_Camera : Camera;


function Start () 
	{
	m_Pos = transform.position;
	
	m_Camera = GetComponent(Camera) as Camera;
	if (m_Camera)
		{
		m_fov = m_Camera.fieldOfView;
		m_savedFov = m_Camera.fieldOfView;
		}
		
	// Make the rigid body not change rotation
	
   	if (rigidbody)
		rigidbody.freezeRotation = true;
	}

	
function OnEnable ()
	{
	m_Pos = transform.position;
	
	if (m_Camera)
		m_fov = m_Camera.fieldOfView;		
	}

	
function OnDisable ()
	{
	if (m_Camera)
		m_Camera.fieldOfView = m_savedFov;
	}
	
	
function LateUpdate () 
	{
	if (!target) return;
	
	var targetpos : Vector3;
	
	if (target.rigidbody)
		targetpos = target.rigidbody.worldCenterOfMass;
	else
		targetpos = target.position;
		
	// Posición
	
	var stepSize = moveSpeed * Time.deltaTime;
	
	m_Pos += Input.GetAxis("Sideways") * transform.right * stepSize;
	m_Pos += Input.GetAxis("Upwards") * transform.up * stepSize;
	m_Pos += Input.GetAxis("Forwards") * Vector3(transform.forward.x, 0.0, transform.forward.z).normalized * stepSize;
	
	transform.position = Vector3.Lerp(transform.position, m_Pos, moveDamping * Time.deltaTime);
	
	// Orientación

	var rotation = Quaternion.LookRotation(targetpos - transform.position);
	transform.rotation = Quaternion.Slerp(transform.rotation, rotation, Time.deltaTime * damping);
	
	// Zoom opcional con cámara presente
	
	if (m_Camera)
		{
		m_fov -= Input.GetAxis("Mouse ScrollWheel") * fovSensitivity;
		m_fov = Mathf.Clamp(m_fov, minFov, maxFov);
		m_Camera.fieldOfView = Mathf.Lerp(m_Camera.fieldOfView, m_fov, fovDamping * Time.deltaTime);
		}
	}


