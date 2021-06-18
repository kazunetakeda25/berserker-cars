using UnityEngine;
using System.Collections;

public class CameraController : MonoBehaviour
{
    public Transform cameraTarget;
    public float OffsetZ = -15.0f;
    public float OffsetX = -5.0f;
    public float ConstantY = 5.0f;
    public float CameraLerpDampening = 0.05f;

	void Start()
    {	
	}
	
	void Update()
	{
        if (cameraTarget == null)
        {
            return;
        }

        Vector3 targetPosition = new Vector3(cameraTarget.position.x + OffsetX, ConstantY, cameraTarget.position.z + OffsetZ);
        transform.position = Vector3.Lerp(transform.position, targetPosition, CameraLerpDampening);
	}
}
