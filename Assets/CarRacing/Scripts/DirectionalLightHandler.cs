using UnityEngine;
using System.Collections;

public class DirectionalLightHandler : MonoBehaviour {

	public float minVal = 0.1f;
	public float maxVal=0.3f;
	public float repeatRateMax;
	public Light light;
	// Use this for initialization
	void Start () {
		InvokeRepeating ("dimLight", 0, repeatRateMax);
	
	}
	void dimLight()
	{
		float rand = Random.Range (minVal, maxVal);
		light.intensity = rand;
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
