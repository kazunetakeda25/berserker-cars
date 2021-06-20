using UnityEngine;
using UnityEditor;

public class EditPivotMenu : Editor 
{
	
	static bool updateCollider = true;
	static public bool UpdateCollider 
	{
		get	{ return updateCollider; }
	}
	
	static bool updatePrefab = true;
	static public bool UpdatePrefab 
	{
		get	{ return updatePrefab; }
	}
	
	[MenuItem ("GameObject/Center Pivot", false, 48)]
	public static void CenterPivot()
	{
		Undo.RegisterSceneUndo("Center Pivot: " + Selection.activeGameObject.name );
		EditPivot.CenterToMesh( Selection.activeGameObject, updateCollider, updatePrefab );		
		CheckError();
	}
	
	[MenuItem ("GameObject/Center Pivot", true)]
	public static bool ValidateCenterPivot()
	{
		return Validate();
	}
	
	[MenuItem ("GameObject/Edit Pivot", false, 49)]
	public static void Editpivot()
	{
		if( !Selection.activeGameObject.GetComponent<EditPivotBehaviour>() )
		{
			Undo.RegisterSceneUndo("Edit Pivot: " + Selection.activeGameObject.name );		
			Selection.activeGameObject.AddComponent<EditPivotBehaviour>();
		}
	}
	
	[MenuItem ("GameObject/Edit Pivot", true)]
	public static bool ValidateEditPivot()
	{
		return Validate();
	}
	
#region Update prefab
	[MenuItem ("GameObject/Options/Update Prefab - Switch On",false, 50)]
	public static void UpdatePrefabOn()
	{
		updatePrefab = true;
		Debug.Log( "EditPivot: Prefab gets updated." );
	}
	
	[MenuItem ("GameObject/Options/Update Prefab - Switch On", true)]
	public static bool ValidateUpdatePrefabOn()
	{
		return (!updatePrefab);
	}
	
	[MenuItem ("GameObject/Options/Update Prefab - Switch Off",false, 51)]
	public static void UpdatePrefabOff()
	{
		updatePrefab = false;
		Debug.Log( "EditPivot: Does not Update Prefabs anymore, Meshes are copied - loss of link to mesh." );
	}
	
	[MenuItem ("GameObject/Options/Update Prefab - Switch Off", true)]
	public static bool ValidateUpdatePrefabOff()
	{
		return updatePrefab;
	}
#endregion
	
#region Collider Update Toggle 
	[MenuItem ("GameObject/Options/UpdateCollider - Switch On",false, 53)]
	public static void ColliderUpdateOn()
	{
		updateCollider = true;
		Debug.Log( "EditPivot: Collider update on pivot change." );
	}
	
	[MenuItem ("GameObject/Options/UpdateCollider - Switch On", true)]
	public static bool ValidateColliderUpdateOn()
	{
		return (!updateCollider);
	}
	
	[MenuItem ("GameObject/Options/UpdateCollider - Switch Off",false, 54)]
	public static void ColliderUpdateOff()
	{
		updateCollider = false;
		Debug.Log( "EditPivot: Collider does not update on pivot change." );
	}
	
	[MenuItem ("GameObject/Options/UpdateCollider - Switch Off", true)]
	public static bool ValidateColliderUpdateOff()
	{
		return updateCollider;
	}
#endregion	
	
	static bool Validate()
	{
		if ( Selection.activeGameObject )
		{
			bool hasMesh =  Selection.activeGameObject.GetComponent<MeshFilter>() != null;			
			if ( hasMesh )
			{
				return true;
			}
		}
		return false;
	}
	
	static void CheckError()
	{			
		if ( EditPivot.Errormsg != "" )
		{
			Debug.Log( EditPivot.Errormsg );
		}
	}
}
