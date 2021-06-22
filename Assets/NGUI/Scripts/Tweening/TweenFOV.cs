//----------------------------------------------
//            NGUI: Next-Gen UI kit
// Copyright © 2011-2012 Tasharen Entertainment
//----------------------------------------------

using UnityEngine;

/// <summary>
/// Tween the camera's field of view.
/// </summary>

[RequireComponent(typeof(Camera))]
[AddComponentMenu("NGUI/Tween/Field of View")]
public class TweenFOV : UITweener
{
	public float from;
	public float to;

	Camera mCam;

	public Camera cachedCamera { get { if (mCam == null) mCam = GetComponent<Camera>(); return mCam; } }
	public float fov { get { return cachedCamera.fieldOfView; } set { cachedCamera.fieldOfView = value; } }

	override protected void OnUpdate (float factor, bool isFinished) { cachedCamera.fieldOfView = from * (1f - factor) + to * factor; }

	/// <summary>
	/// Start the tweening operation.
	/// </summary>

	static public TweenFOV Begin (GameObject go, float duration, float to)
	{
		TweenFOV comp = UITweener.Begin<TweenFOV>(go, duration);
		comp.from = comp.fov;
		comp.to = to;
		return comp;
	}
}