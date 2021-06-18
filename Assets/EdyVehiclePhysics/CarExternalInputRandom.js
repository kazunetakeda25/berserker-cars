

// Sample for providing automated input to a vehicle. 
// This sample adds random input.
// 
// Add to the car that needs to be controlled, then enable externalInput in its CarSettings component.
// The inherited field m_CarControl references the CarControl script of the controlled vehicle.


class CarExternalInputRandom extends CarExternalInput {


var steerInterval = 2.0;
var steerIntervalMargin = 1.0;
var steerSpeed = 4.0;
var steerStraightRandom = 0.4;

var throttleInterval = 5.0;
var throttleIntervalMargin = 2.0;
var throttleSpeed = 3.0;
var throttleForwardRandom = 0.8;
var throttleReverseRandom = 0.6;

	
private var m_targetSteer = 0.0;
private var m_nextSteerTime = 0.0;

private var m_targetThrottle = 0.0;
private var m_targetBrake = 0.0;
private var m_targetGear = 0;
private var m_nextThrottleTime = 0.0;


function Awake ()
	{
	// If you need to use the Awake method then ensure to call the ancestor first 
	// so the protected m_CarControl filed is initialized.
	
	super();
	
	// Do your Awake initialization here.
	
	}



function Update () 
	{
	// Set a random steer value
	
	if (Time.time > m_nextSteerTime)
		{
		if (Random.value < steerStraightRandom)
			m_targetSteer = 0.0;
		else
			m_targetSteer = Random.Range(-1.0, 1.0);
		
		m_nextSteerTime = Time.time + steerInterval + Random.Range(-steerIntervalMargin, steerIntervalMargin);
		}
	
	// Set a random throttle-gear-brake value.
	// At low speed chances are that the vehicle has encountered an obstacle.
	// If so, we increase the probability of going reverse.
	
	if (Time.time > m_nextThrottleTime)
		{
		var forwardRandom = throttleForwardRandom;
		var speed = rigidbody.velocity.magnitude;
		
		if (speed < 0.1 && m_targetBrake < 0.001 && m_targetGear != -1) forwardRandom *= 0.4;
		
		if (Random.value < forwardRandom)
			{
			m_targetGear = 1;
			m_targetThrottle = Random.value;
			m_targetBrake = 0.0;
			}
		else
			{
			if (speed < 0.5)
				{
				m_targetGear = -1;
				m_targetBrake = 0.0;
				m_targetThrottle = Random.value;
				}
			else
				{
				m_targetThrottle = 0.0;
				m_targetBrake = Random.value;
				}
			}
		
		m_nextThrottleTime = Time.time + throttleInterval + Random.Range(-throttleIntervalMargin, throttleIntervalMargin);
		}
		
	// Apply the input progressively
	
	m_CarControl.steerInput = Mathf.MoveTowards(m_CarControl.steerInput, m_targetSteer, steerSpeed * Time.deltaTime);	
	m_CarControl.motorInput = Mathf.MoveTowards(m_CarControl.motorInput, m_targetThrottle, throttleSpeed * Time.deltaTime);	
	m_CarControl.brakeInput = m_targetBrake;
	m_CarControl.gearInput = m_targetGear;
	
	m_CarControl.handbrakeInput = 0.0;
	}
	
	
	
function OnCollisionEnter(collision : Collision) 
	{
	if (enabled && collision.contacts.length > 0)
		{
		// Front / rear collisions reduce the waiting time for taking the next throttle decision.

		var colRatio = Vector3.Dot(transform.forward, collision.contacts[0].normal);
		if (colRatio > 0.8 || colRatio < -0.8)
			m_nextThrottleTime -= throttleInterval * 0.5;
			
		// Sideways collisions reduce the waiting time for taking the next steering decision
		
		if (colRatio > -0.4 && colRatio < 0.4)
			m_nextSteerTime -= steerInterval * 0.5;
		}
	}

}