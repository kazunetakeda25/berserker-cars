using UnityEngine;
using System.Collections;

public class WayCheck : MonoBehaviour {
	public int wayNumb=1;
	public int dir =-1;
	public Vector3 carRefereshPos;
	public Vector3 rot;
	public bool isLocalRot = false;

	void OnTriggerEnter(Collider col){
		if(col.tag =="Player"){
			Debug.Log ("enter");

			col.gameObject.SendMessage("setCheckPointNumb",wayNumb);
		}

		if(col.tag =="Opponent"){
			
			col.gameObject.SendMessage("setCheckPointNumb",wayNumb);
		}
	}
}
