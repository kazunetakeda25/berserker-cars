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
// CarDamage
//
// Manages the mesh deformation on impacts, as well as deform nodes and colliders.
//
//========================================================================================================================

#pragma strict

var minForce = 1.0;
var multiplier = 0.1;
var deformRadius = 1.0;
var deformNoise = 0.1;
var deformNodeRadius = 0.5;
var maxDeform = 0.5;
var maxNodeRotationStep = 10.0;
var maxNodeRotation = 14.0;
var bounceBackSpeed = 2.0;
var bounceBackSleepCap = 0.002;
var autoBounce = false;

var DeformMeshes : MeshFilter[];
var DeformNodes : Transform[];
var DeformColliders : MeshCollider[];


class VertexData extends System.Object 
	{
	var permaVerts : Vector3[];
	}
	
private var m_meshData : VertexData[];
private var m_colliderData : VertexData[];
	
private var m_permaNodes : Vector3[];
private var m_permaNodeAngles : Vector3[];
private var m_nodeModified : boolean[];

private var m_sleep = true;
private var m_doBounce = false;


function Start ()
	{
	// Almacenar los vértices originales de los meshes a deformar
	return;
	m_meshData = new VertexData[DeformMeshes.length];
	
	for (var i=0; i<DeformMeshes.length; i++)
		{
		m_meshData[i] = new VertexData();
		m_meshData[i].permaVerts = DeformMeshes[i].mesh.vertices;
		}
		
	// Almacenar los vértices originales de los colliders a deformar

	m_colliderData = new VertexData[DeformColliders.length];
	
	for (i=0; i<DeformColliders.length; i++)
		{
		m_colliderData[i] = new VertexData();
		m_colliderData[i].permaVerts = DeformColliders[i].sharedMesh.vertices;
		}	
		
	// Almacenar posición y orientación originales de los nodos a deformar
	
	m_permaNodes = new Vector3[DeformNodes.length];
	m_permaNodeAngles = new Vector3[DeformNodes.length];
	m_nodeModified = new boolean[DeformNodes.length];
	
	for (i=0; i<DeformNodes.length; i++)
		{
		m_permaNodes[i] = DeformNodes[i].localPosition;
		m_permaNodeAngles[i] = AnglesToVector(DeformNodes[i].localEulerAngles);
		}
	}

	
private function DeformMesh(mesh : Mesh, originalMesh : Vector3[], localTransform : Transform, contactPoints : ContactPoint[], contactForce : Vector3)
	{
	var vertices = mesh.vertices;
	
	for (var contact in contactPoints)
		{			
		if (typeof(contact.thisCollider) == WheelCollider) continue;	
		var contactPoint = localTransform.InverseTransformPoint(contact.point);
		
		for (var i=0; i<vertices.length; i++)
			{
			var dist = (contactPoint-vertices[i]).magnitude;
				
			if (dist < deformRadius)
				{
				vertices[i] += (contactForce * (deformRadius - dist) / deformRadius) + Random.onUnitSphere * deformNoise;
					
				var deform = vertices[i]-originalMesh[i];
				if (deform.magnitude > maxDeform)
					vertices[i] = originalMesh[i] + deform.normalized * maxDeform;
				}
			}
		}
		
	mesh.vertices = vertices;
	mesh.RecalculateNormals();
	mesh.RecalculateBounds();
	}

	
// Devuelve TRUE si se han modificado los ángulos. Así se puede asegurar que sólo se modifican una vez por cada colisión, en vez de una por contacto.

private function DeformNode(T : Transform, originalLocalPos : Vector3, originalLocalRot : Vector3, contactPoint : Vector3, contactVector : Vector3) : boolean
	{
	var result = false;	
	var localPos = transform.InverseTransformPoint(T.position);
	
	var dist = (contactPoint-localPos).magnitude;
	
	// Deformar posición
	
	if (dist < deformRadius)
		{
		var deformForce = (deformRadius - dist) / deformRadius;
		
		T.localPosition += contactVector * deformForce + Random.onUnitSphere * deformNoise;
		
		var deform = T.localPosition - originalLocalPos;
		
		if (deform.magnitude > maxDeform)
			T.localPosition = originalLocalPos + deform.normalized * maxDeform;
		
		result = true;
		}
		
	// Deformar rotación
		
	if (dist < deformNodeRadius)
		{
		var angles = AnglesToVector(T.localEulerAngles);
		
		var angleLimit = Vector3(maxNodeRotation, maxNodeRotation, maxNodeRotation);		
		var angleMax = angles + angleLimit;
		var angleMin = angles - angleLimit;
		
		angles += deformForce * Random.onUnitSphere * maxNodeRotationStep;
				
		T.localEulerAngles = Vector3(Mathf.Clamp(angles.x, angleMin.x, angleMax.x), Mathf.Clamp(angles.y, angleMin.y, angleMax.y), Mathf.Clamp(angles.z, angleMin.z, angleMax.z));
		
		result = true;		
		}
		
	return result;
	}


// Devuelve TRUE si todos los vértices han alcanzado ya su posición original, FALSE si queda alguno por llegar.
	
private function BounceMesh(mesh : Mesh, originalMesh : Vector3[], bounceDelta : float)	: boolean
	{
	var result = true;	
	var vertices = mesh.vertices;
	
	for (var i=0;i<vertices.length; i++) 
		{
		var deform = originalMesh[i] - vertices[i];
		
		vertices[i] += deform * bounceDelta;
		if (deform.magnitude >= bounceBackSleepCap) 
			result = false;
		}
		
	mesh.vertices = vertices;
	mesh.RecalculateNormals();
	mesh.RecalculateBounds();
	
	return result;
	}
	

// Devuelve TRUE si todos los nodos han alcanzado ya su posición y orientación originales, FALSE si queda alguno por llegar.
	
private function BounceNode(T : Transform, originalLocalPos : Vector3, originalLocalAngles : Vector3, bounceDelta : float) : boolean
	{
	// Restaurar hacia la posición original
	
	var deformPos = originalLocalPos - T.localPosition;	
	T.localPosition += deformPos * bounceDelta;
	
	// Restaurar hacia los ángulos originales

	var Angles = AnglesToVector(T.localEulerAngles);	
	var deformAngle = originalLocalAngles - Angles;
	Angles += deformAngle * bounceDelta;	
	T.localEulerAngles = Angles;
	
	// Los ángulos parece que pillan peor la tolerancia. Se les da el doble de margen, total se restaurarán al terminar el proceso de Bounce.
	
	return deformPos.magnitude < bounceBackSleepCap && deformAngle.magnitude < (bounceBackSleepCap * 2); 
	}

	
private function RestoreNode(T : Transform, originalLocalPos : Vector3, originalLocalAngles : Vector3)
	{
	T.localPosition = originalLocalPos;
	T.localEulerAngles = originalLocalAngles;
	}
	
	
private function AnglesToVector(Angles : Vector3) : Vector3
	{
	if (Angles.x > 180) Angles.x = -360+Angles.x;
	if (Angles.y > 180) Angles.y = -360+Angles.y;
	if (Angles.z > 180) Angles.z = -360+Angles.z;
	return Angles;
	}

	
	
private function RestoreColliders()
	{
	if (DeformColliders.length > 0)
		{
		var CoM = rigidbody.centerOfMass;
		
		for (var i=0; i<DeformColliders.length; i++)
			{
			// Necesario un mesh intermedio con los datos actuales.
			
			var mesh : Mesh = new Mesh();
			mesh.vertices = m_colliderData[i].permaVerts;
			mesh.triangles = DeformColliders[i].sharedMesh.triangles;
			
			mesh.RecalculateNormals();
			mesh.RecalculateBounds();
			
			DeformColliders[i].sharedMesh = mesh;
			}
		
		rigidbody.centerOfMass = CoM;				
		}
	}
	
	
//--------------------------------------------------------------
function OnCollisionEnter (collision : Collision)
	{
	return;
	if (collision.relativeVelocity.magnitude >= minForce)
		{
		m_sleep = false;
		var contactForce = transform.InverseTransformDirection(collision.relativeVelocity) * multiplier * 0.1;
		
		// Deformar los meshes
		
		for (var i=0; i<DeformMeshes.length; i++)
			DeformMesh(DeformMeshes[i].mesh, m_meshData[i].permaVerts, DeformMeshes[i].transform, collision.contacts, contactForce);
			
		// Deformar los colliders

		if (DeformColliders.length > 0)
			{
			var CoM = rigidbody.centerOfMass;
			
			for (i=0; i<DeformColliders.length; i++)
				{
				// Necesario un mesh intermedio, no sirve mandar sharedMesh a deformar
				
				var mesh : Mesh = new Mesh();
				mesh.vertices = DeformColliders[i].sharedMesh.vertices;
				mesh.triangles = DeformColliders[i].sharedMesh.triangles;
				
				DeformMesh(mesh, m_colliderData[i].permaVerts, DeformColliders[i].transform, collision.contacts, contactForce);				
				DeformColliders[i].sharedMesh = mesh;
				}
				
			rigidbody.centerOfMass = CoM;
			}

		// Deformar los nodos. Cada uno se modifica una vez por cada colisión, usando el punto de contacto que primero lo modifique.

		for (i=0; i<DeformNodes.length; i++)
			m_nodeModified[i] = false;

		for (var c=0; c<collision.contacts.length; c++)
			{
			if (typeof(collision.contacts[c].thisCollider) == WheelCollider) continue;
			var contactPoint = transform.InverseTransformPoint(collision.contacts[c].point);
			
			for (i=0; i<DeformNodes.length; i++)
				if (!m_nodeModified[i]) m_nodeModified[i] = DeformNode(DeformNodes[i], m_permaNodes[i], m_permaNodeAngles[i], contactPoint, contactForce);
			}
		}
	}
	
//--------------------------------------------------------------

function DoBounce ()
	{
	m_doBounce = true;
	m_sleep = false;
	}
	


//--------------------------------------------------------------
function Update () 
	{
	return;
	if (!m_sleep && (autoBounce || m_doBounce) && bounceBackSpeed > 0) 
		{
		var deformDelta = Time.deltaTime * bounceBackSpeed;
		
		m_sleep = true;
		
		// Mover los meshes hacia su posición original
		
		for (var i=0; i<DeformMeshes.length; i++)
			m_sleep &= BounceMesh(DeformMeshes[i].mesh, m_meshData[i].permaVerts, deformDelta);
		
		// Mover los nodos hacia su posición y orientación originales

		for (i=0; i<DeformNodes.length; i++)
			m_sleep &= BounceNode(DeformNodes[i], m_permaNodes[i], m_permaNodeAngles[i], deformDelta);
			
		// Al finalizar la restauración progresiva los nodos se llevan a sus posiciones y orientaciones exactas (evitar errores de aproximación)
		// Los colliders también se restauran de una vez.
			
		if (m_sleep)
			{
			m_doBounce = false;
			
			// Restaurar estado exacto de los nodos
			
			for (i=0; i<DeformNodes.length; i++)
				RestoreNode(DeformNodes[i], m_permaNodes[i], m_permaNodeAngles[i]);
				
			// Restaurar estado exacto de los colliders
			
			RestoreColliders();
			}			
		}
	}
	

	
	
	
	
	
	
	
	
	
	
	
	