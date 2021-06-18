
#pragma strict

var Pos : Transform;

function LateUpdate () 
	{
	transform.position = Pos.transform.position;
	transform.rotation = Pos.transform.rotation;
	}