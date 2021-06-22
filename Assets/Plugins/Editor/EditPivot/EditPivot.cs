using UnityEngine;
using UnityEditor;
using System.Collections.Generic;
using System.Linq;

public static class EditPivot 
{
	/// <summary>
	/// Simple Error string, of what went wrong at last EditPivot call.
	/// </summary>	
	public static string Errormsg { get; private set; }
	
	/// <summary>
	/// Moves the pivot of the GameObject to the targetposition.
	/// </summary>	
	public static void MovePivot( GameObject go, Vector3 targetposition, bool updateCollider=true, bool updatePrefab=true )
	{
		//avoid moving if already at targetposition -> messes up collider
		if( go.transform.position == targetposition )
		{
			return;
		}		
		
		bool sharedColliderMesh = false;
		if( go.GetComponent<MeshFilter>() != null && go.GetComponent<MeshCollider>() != null )
		{
			sharedColliderMesh = go.GetComponent<MeshFilter>().sharedMesh == go.GetComponent<MeshCollider>().sharedMesh; 
		}
		
		// try to grab the prefab mesh - otherwise deepcopy the mesh, results in loss of link to the imported model
		Mesh mesh;		
		if ( updatePrefab )
		{
			PrefabType prefabtype = PrefabUtility.GetPrefabType( go );
			if ( prefabtype == PrefabType.ModelPrefab || prefabtype == PrefabType.Prefab )
			{
				mesh = GetMesh( go, false );
			}			
			else if ( prefabtype == PrefabType.PrefabInstance || prefabtype == PrefabType.ModelPrefabInstance )
			{				
				//Object o = PrefabUtility.GetPrefabObject( (Object) go );
				mesh = GetMesh( go, false );
			}
			else
			{			
				mesh = GetMesh( go, true );	
			}
		}
		else
		{
			mesh = GetMesh( go, true );	
		}	
		 
		List<Transform> children = GetChildren( go );	
		if ( !mesh && children == null )
		{
			return;
		}	
		
		Errormsg = "";	
		
		// get offset vector
		Vector3 offset = go.transform.position-targetposition;
		
		// do offset movement on mesh
		if ( mesh )
		{
			MoveMesh( ref mesh, offset, go.transform.worldToLocalMatrix );
		}
		
		// do offset on collider if desired
		if(updateCollider)
		{
			MoveCollider( go, offset, sharedColliderMesh );
		}
		
		//set transform to targetposition
		go.transform.position = targetposition;
		
		// update child positions 		
		if ( children != null)
		{
			foreach ( var child in children )
			{				
				child.Translate( offset );
			}
		}	
		
	}
	/// <summary>
	/// Centers the pivot to the center of the attached mesh.
	/// </summary>	
	public static void CenterToMesh( GameObject go, bool updateCollider = true, bool updatePrefab=true )
	{		
		Mesh mesh = GetMesh( go, false );
		
		if ( !mesh )
		{
			return;
		}	
	
		// get center of mesh
		Vector3 center = Vector3.zero;
		for ( int i=0; i<mesh.vertexCount; i++ )
		{
			center +=  mesh.vertices[i] ;
		}		
		center /= mesh.vertexCount;
		center = go.transform.localToWorldMatrix.MultiplyPoint( center );		
		
		// avoid moving if were already centered -> messes up collider
		if( center != go.transform.position )
		{
			MovePivot( go, center, updateCollider, updatePrefab );					
		}
	}
	/// <summary>
	/// Centers the pivot to the center of all child transforms.
	/// </summary>	
	public static void CenterToChildren( GameObject go, bool updateCollider = true, bool updatePrefab=true )
	{
		List<Transform> children = GetChildren ( go, false );
		
		if( children == null )
		{
			return;
		}
					
		// get center of children
		Vector3 center = Vector3.zero;
		for ( int i=0; i<children.Count; i++ )
		{
			center +=  children[i].position;
		}
		center /= children.Count;
		
		// avoid moving if were already centered -> messes up collider
		if( center != go.transform.position )
		{
			MovePivot( go, center, updateCollider );					
		}
	}
		
	static void MoveCollider( GameObject go, Vector3 offset, bool sharedColliderMesh )
	{
		Collider collider = go.GetComponent<Collider>();
		Vector3 targetpos = go.transform.worldToLocalMatrix.MultiplyVector( offset );
		if( collider )
		{			
			if ( collider is BoxCollider )
			{
				((BoxCollider)collider).center += targetpos;
				return;
			}
			if ( collider is SphereCollider )
			{
				((SphereCollider)collider).center += targetpos;
				return;
			}
			if ( collider is CapsuleCollider )
			{
				((CapsuleCollider)collider).center += targetpos;
				return;
			}
			if ( collider is WheelCollider )
			{
				((WheelCollider)collider).center += targetpos;
				return;
			}
			if ( collider is TerrainCollider )
			{
				Debug.Log( "EditPivot: Currently not supporting TerrainCollider" );
				return;
			}
			if ( collider is MeshCollider )
			{
				if( sharedColliderMesh )
				{
					((MeshCollider)collider).sharedMesh = go.GetComponent<MeshFilter>().sharedMesh;
				}
				else
				{
					Mesh mesh = DeepCopyMesh( ((MeshCollider)collider).sharedMesh );
					// delete mesh if its a copy - ie. not in AssetDatabase
					if ( !AssetDatabase.Contains( ((MeshCollider)collider).sharedMesh.GetInstanceID() ))
					{
						Object.DestroyImmediate( ((MeshCollider)collider).sharedMesh );
					}
					MoveMesh( ref mesh, offset, go.transform.worldToLocalMatrix );
					((MeshCollider)collider).sharedMesh = mesh;
				}				
			}
		}
	}
	
	
	// grab all vertices and offset
	static void MoveMesh( ref Mesh mesh, Vector3 offset, Matrix4x4 matrix )
	{
		Vector3[] vertices = mesh.vertices;
		for( int i=0; i< mesh.vertexCount; i++ )
		{
			vertices[i] += matrix.MultiplyVector( offset );
		}
		mesh.vertices = vertices;
		mesh.RecalculateBounds();		
	}
		
	// deep copy a mesh
	static Mesh DeepCopyMesh( Mesh source )
	{	
		if ( !source )
		{
			Debug.LogError( "EditPivot: source is null!");
			return null;
		}
		Mesh mesh = new Mesh();		
			
		if ( source.name.EndsWith( ".copy" ))
		{
			mesh.name =  source.name;
		}
		else
		{	
			mesh.name =  source.name + ".copy";
		}		
		
		mesh.vertices = source.vertices;
		mesh.normals = source.normals;
		mesh.triangles = source.triangles;
		mesh.uv = source.uv;
		mesh.tangents = source.tangents;
		mesh.boneWeights = source.boneWeights;
		mesh.bindposes = source.bindposes;
		mesh.colors = source.colors;
		
		;
		mesh.RecalculateBounds();
		mesh.RecalculateNormals();		
		return mesh;
	}
		
	static List<Transform> GetChildren( GameObject go, bool onlyFirstLevel = true )
	{
		if ( go.transform.childCount == 0 )
		{
			Errormsg = "EditPivot: '" + go.name + "' has no children!";			
			return null;
		}
		List<Transform> children = new List<Transform>();
		if ( onlyFirstLevel )
		{
			for ( int i=0; i< go.transform.childCount; i++ )
			{
				children.Add( go.transform.GetChild(i) );
			}
		}
		else
		{
			children = go.transform.GetComponentsInChildren<Transform>().ToList();
			children.Remove( go.transform );
		}
		return children;
	}
	
	static Mesh GetMesh( GameObject go, bool copy = true )
	{
		Errormsg = "";
		
		if ( go )
		{			
			MeshFilter meshfilter = go.GetComponent<MeshFilter>();
			if ( meshfilter )
			{				
				if ( meshfilter.sharedMesh )
				{
					if ( copy )
					{
						Mesh mesh = DeepCopyMesh( meshfilter.sharedMesh );
						// delete mesh if its a copy
						if ( !AssetDatabase.Contains( meshfilter.sharedMesh.GetInstanceID() ))
						{
							Object.DestroyImmediate( meshfilter.sharedMesh );
						}
						meshfilter.mesh = mesh;
						return mesh;
					}
					else
					{
						return meshfilter.sharedMesh;
					}
				}
				else
				{
					Errormsg = "EditPivot: '" + go.name + "' has no mesh assigned!";
					Debug.Log( Errormsg );
					return null;
				}
			}
			else
			{
				Errormsg = "EditPivot: '" + go.name + "' does not have a mesh!";
				Debug.Log( Errormsg );
				return null;
			}
		}
		else
		{
			Errormsg = "EditPivot: Gameobject is null!";
			Debug.Log( Errormsg );
			return null;
		}
	}
}
