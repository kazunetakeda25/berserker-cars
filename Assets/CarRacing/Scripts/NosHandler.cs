using UnityEngine;
using System.Collections;

public class NosHandler : MonoBehaviour {

	public GameObject root;
	public GameObject particle;
	// Use this for initialization
	void Start () {
		Collider [] hitColliders = Physics.OverlapSphere(transform.position, 4);

		for (int i = 0; i < hitColliders.Length; i++) {
			if(hitColliders[i].tag == "test"){
				Debug.Log("tag" + hitColliders[i].tag);
			}
		}
	
	}
	void OnTriggerEnter(Collider col){
		if(col.tag =="Player"){
			Debug.Log ("enter noss");
			col.gameObject.SendMessage("NossCollected");
			particle.SetActive(true);
			root.SetActive(false);
			Destroy(gameObject,1);

		}
	}
}
