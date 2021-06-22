using UnityEngine;
using System.Collections;

public class CarBodyMatTiling : MonoBehaviour {
	Material [] mats;
	public Material tempSkyBox;
	// Use this for initialization
	void Start () {
		RenderSettings.skybox = tempSkyBox;
		mats = GetComponent<Renderer>().materials;
	}
	
	// Update is called once per frame
	void Update () {
	//	renderer.materials[0].mainTextureOffset -= new Vector2 (0, -0.01f);
		//renderer.materials[1].mainTextureOffset -= new Vector2 (0, -0.01f);

		float shininess  = Random.Range (0f, 1.0f);
	//	Debug.Log(" " +renderer.materials [0].shader);//.SetFloat("".mainTextureOffset -= new Vector2 (0, -0.01f);
//		renderer.materials[0].SetFloat( "_Shininess", shininess );
//		renderer.materials[2].SetFloat( "_Shininess", shininess );
	
	}
}
