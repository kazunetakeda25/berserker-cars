using UnityEngine;
using System.Collections;

public class ExitUIController : MonoBehaviour {
	
	void NoPressed(){

		Destroy (gameObject);
		Resources.UnloadUnusedAssets ();
	}

	void YesPressed(){
		Application.Quit ();
	}
}
