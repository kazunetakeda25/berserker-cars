using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif

// unity doesnt get the access through scriptable objects
#pragma warning disable 414

// simple data holder class for use as a component
[ExecuteInEditMode][AddComponentMenu ("Mesh/Edit Pivot")]
public class EditPivotBehaviour : MonoBehaviour 
{
#if UNITY_EDITOR
	[SerializeField] Vector3 pivotposition;
	public Vector3 Pivotposition 
	{ 
		get
		{
			return pivotposition;	
		}
		set
		{
			pivotposition = value;	
		}
	}
	
	[SerializeField] Tool lasttool = Tool.None;
	[SerializeField] GameObject refGO;
	[SerializeField] Vector3 originalposition;
	
	// unity 3.5 crashes when directly destroying a component at startup, so I chache and destroy at update 
	bool selfdestroy = false;
	
	void Reset()
	{
		Pivotposition = transform.position;
	}
	
	void Awake()
	{	
		if( gameObject.GetComponents<EditPivotBehaviour>().Length > 1 )
		{			
			selfdestroy = true;
		}
		else
		{
			
			Pivotposition = transform.position;
			originalposition = transform.position;
	
		}
	}
	
	void Update()
	{
		if (selfdestroy)
		{
			DestroyImmediate( this );	
		}
	}
#endif
}
