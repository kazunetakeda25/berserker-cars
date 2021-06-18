

// Interface for allowing alternate input methods for the vehicles.
// The class providing the input must inherit from this one so it could be enabled / disabled from CarSettings (CarSettings.externalInput).
//
// This interface allows input methods such IA or network.
// See the example at CarExternalInputRandom, which randomly controls the vehicle.


#pragma strict

protected var m_CarControl : CarControl;

function Awake () 
	{
	m_CarControl = GetComponent(CarControl) as CarControl;
	}


// Override Update or FixedUpdate in the children classes for assigning input values to CarControl
// Remember you can use the variables from the rigidbody (i.e. rigidbody.velocity) and any other car's component.


/*
function Update ()
	{
	m_CarControl.steerInput = 0.0;
	m_CarControl.motorInput = 0.0;
	m_CarControl.brakeInput = 1.0;
	m_CarControl.handbrakeInput = 0.0;
	m_CarControl.gearInput = 1;
	}
*/